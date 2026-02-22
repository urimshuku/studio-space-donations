import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  if (!rawBody || rawBody.length === 0) {
    return new Response("Bad Request", { status: 400 });
  }

  // Reply 200 immediately so PayPal doesn't retry; then verify and process
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response("OK", { status: 200 });
  }

  const verificationBody = `cmd=_notify-validate&${rawBody}`;
  const paypalIpnUrl = Deno.env.get("PAYPAL_IPN_SANDBOX") === "true"
    ? "https://ipnpb.sandbox.paypal.com/cgi-bin/webscr"
    : "https://ipnpb.paypal.com/cgi-bin/webscr";

  let verified = false;
  try {
    const verifyRes = await fetch(paypalIpnUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verificationBody,
    });
    const verifyText = await verifyRes.text();
    verified = verifyText.trim() === "VERIFIED";
  } catch (err) {
    console.error("PayPal IPN verification request failed:", err);
  }

  if (!verified) {
    return new Response("OK", { status: 200 });
  }

  const params = new URLSearchParams(rawBody);
  const paymentStatus = params.get("payment_status");
  if (paymentStatus !== "Completed" && paymentStatus !== "Pending") {
    return new Response("OK", { status: 200 });
  }

  const mcGross = params.get("mc_gross");
  const mcCurrency = params.get("mc_currency") || "USD";
  const custom = params.get("custom");
  if (!mcGross || !custom) {
    console.error("IPN missing mc_gross or custom");
    return new Response("OK", { status: 200 });
  }

  let categoryId: string;
  let donorName: string;
  let isAnonymous: boolean;
  let wordsOfSupport: string | undefined;
  try {
    const data = JSON.parse(custom) as { c?: string; n?: string; a?: boolean; w?: string };
    categoryId = data.c ?? "";
    donorName = data.n ?? "Anonymous";
    isAnonymous = Boolean(data.a);
    wordsOfSupport = data.w && data.w.length > 0 ? data.w.slice(0, 150) : undefined;
  } catch {
    console.error("IPN custom field invalid JSON:", custom);
    return new Response("OK", { status: 200 });
  }

  if (!categoryId) {
    console.error("IPN custom missing category id");
    return new Response("OK", { status: 200 });
  }

  const amountPaid = parseFloat(mcGross);
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    return new Response("OK", { status: 200 });
  }

  // Store amount in EUR for consistency with app; convert if PayPal sent USD
  const usdToEur = Number(Deno.env.get("PAYPAL_USD_TO_EUR")) || 1 / 1.08;
  const amountEur = mcCurrency === "USD" ? amountPaid * usdToEur : amountPaid;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { error: insertError } = await supabase.from("donations").insert({
    category_id: categoryId,
    donor_name: donorName,
    amount: amountEur,
    is_anonymous: isAnonymous,
    words_of_support: wordsOfSupport,
  });

  if (insertError) {
    console.error("Failed to insert donation from IPN:", insertError);
    return new Response("OK", { status: 200 });
  }

  const { data: category, error: fetchError } = await supabase
    .from("categories")
    .select("current_amount")
    .eq("id", categoryId)
    .single();

  if (!fetchError && category) {
    const newAmount = Number(category.current_amount) + amountEur;
    await supabase
      .from("categories")
      .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
      .eq("id", categoryId);
  } else {
    console.error("Failed to update category current_amount:", fetchError);
  }

  return new Response("OK", { status: 200 });
});
