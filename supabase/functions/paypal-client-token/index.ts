/**
 * Returns a PayPal client token for Hosted Fields (Advanced Card Payments).
 * Frontend uses this with dataClientToken to render card number, expiry, CVV without handling raw card data.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function getPayPalAccessToken(): Promise<string> {
  const clientId = (Deno.env.get("PAYPAL_CLIENT_ID") ?? "").trim();
  const secret = (Deno.env.get("PAYPAL_CLIENT_SECRET") ?? "").trim();
  if (!clientId || !secret) throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");

  const isSandbox = Deno.env.get("PAYPAL_SANDBOX") === "true";
  const base = isSandbox
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

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
    throw new Error(`PayPal auth failed: ${res.status} ${t}`);
  }
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const isSandbox = Deno.env.get("PAYPAL_SANDBOX") === "true";
    const base = isSandbox
      ? "https://api-m.sandbox.paypal.com"
      : "https://api-m.paypal.com";

    const accessToken = await getPayPalAccessToken();
    const res = await fetch(`${base}/v1/identity/generate-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "Accept-Language": "en_US",
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("Generate token failed:", res.status, t);
      throw new Error(`Failed to generate client token: ${res.status} ${t}`);
    }

    const json = await res.json();
    const clientToken = json.client_token;
    if (!clientToken) {
      throw new Error("PayPal did not return a client_token");
    }

    return new Response(JSON.stringify({ client_token: clientToken }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("paypal-client-token error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
