import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") ?? "").trim();
  const secret = (Deno.env.get("PAYPAL_CLIENT_SECRET") ?? "").trim();
  if (!clientId || !secret) throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");

  const base = Deno.env.get("PAYPAL_SANDBOX") === "true"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
  const auth = btoa(`${clientId}:${secret}`);
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase config");
    }

    const { orderID } = await req.json();
    if (!orderID || typeof orderID !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing orderID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const base = Deno.env.get("PAYPAL_SANDBOX") === "true"
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    const captureRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: "{}",
    });

    if (!captureRes.ok) {
      const errText = await captureRes.text();
      console.error("PayPal capture failed:", captureRes.status, errText);
      return new Response(
        JSON.stringify({ error: `Capture failed: ${errText}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: pending, error: fetchError } = await supabase
      .from("pending_paypal_donations")
      .select("category_id, donor_name, amount, is_anonymous, words_of_support")
      .eq("order_id", orderID)
      .single();

    if (fetchError || !pending) {
      console.error("Pending donation not found for order:", orderID, fetchError);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountEur = Number(pending.amount);
    const { error: insertError } = await supabase.from("donations").insert({
      category_id: pending.category_id,
      donor_name: pending.donor_name,
      amount: amountEur,
      is_anonymous: pending.is_anonymous,
      words_of_support: pending.words_of_support || undefined,
    });

    if (insertError) {
      console.error("Failed to insert donation:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to record donation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: category, error: catError } = await supabase
      .from("categories")
      .select("current_amount")
      .eq("id", pending.category_id)
      .single();

    if (!catError && category) {
      const newAmount = Number(category.current_amount) + amountEur;
      await supabase
        .from("categories")
        .update({ current_amount: newAmount, updated_at: new Date().toISOString() })
        .eq("id", pending.category_id);
    }

    await supabase.from("pending_paypal_donations").delete().eq("order_id", orderID);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("paypal-capture-order error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
