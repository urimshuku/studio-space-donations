import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateOrderRequest {
  category_id: string;
  donor_name: string;
  amount: number;
  is_anonymous: boolean;
  words_of_support?: string;
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") ?? "").trim();
  const secret = (Deno.env.get("PAYPAL_CLIENT_SECRET") ?? "").trim();
  if (!clientId || !secret) throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");

  const isSandbox = Deno.env.get("PAYPAL_SANDBOX") === "true";
  const base = isSandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

  // Base64(UTF-8(clientId:secret)) — btoa() only handles Latin1
  const credentials = `${clientId}:${secret}`;
  const bytes = new TextEncoder().encode(credentials);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const auth = btoa(binary);

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
    console.error(
      "PayPal auth failed. Using Sandbox:",
      isSandbox,
      "— Check PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET match the same app and PAYPAL_SANDBOX matches (true for Sandbox app)."
    );
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

    const body: CreateOrderRequest = await req.json();
    const { category_id, donor_name, amount, is_anonymous, words_of_support } = body;
    if (!category_id || !donor_name || amount == null || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: category_id, donor_name, amount required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currency = Deno.env.get("PAYPAL_CURRENCY") || "EUR";
    const valueStr = amount.toFixed(2);

    const accessToken = await getPayPalAccessToken();
    const isSandbox = Deno.env.get("PAYPAL_SANDBOX") === "true";
    const base = isSandbox
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        application_context: {
          shipping_preference: "NO_SHIPPING",
        },
        payment_source: {
          paypal: {
            experience_context: {
              shipping_preference: "NO_SHIPPING",
            },
          },
        },
        purchase_units: [
          {
            amount: { currency_code: currency, value: valueStr },
            description: "Donation",
          },
        ],
      }),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error("PayPal create order failed:", orderRes.status, errText);
      throw new Error(`PayPal create order failed: ${errText}`);
    }

    const order = await orderRes.json();
    const orderId = order.id;
    if (!orderId) throw new Error("PayPal did not return order id");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { error: insertError } = await supabase.from("pending_paypal_donations").insert({
      order_id: orderId,
      category_id,
      donor_name: is_anonymous ? "Anonymous" : donor_name,
      amount,
      is_anonymous,
      words_of_support: words_of_support?.trim().slice(0, 150) || null,
    });

    if (insertError) {
      console.error("Failed to store pending donation:", insertError);
      throw new Error("Failed to store pending donation");
    }

    return new Response(
      JSON.stringify({ orderID: orderId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("paypal-create-order error:", err);
    let message = err instanceof Error ? err.message : "Internal server error";
    if (message.includes("401") || message.includes("invalid_client")) {
      message += " Check Supabase Edge Function secrets: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be from the same app as your frontend. If using a Sandbox app, set PAYPAL_SANDBOX=true.";
    }
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
