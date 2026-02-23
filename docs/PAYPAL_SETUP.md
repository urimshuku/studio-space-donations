# PayPal JavaScript SDK checkout (full customization)

This app uses the **PayPal JavaScript SDK** so the donation form and amount stay on your site; only the payment step uses PayPal’s UI (popup or inline), which you can style.

## Which account receives the money

Payments go to the **PayPal account** linked to the **Client ID** you use. The Client ID is created in the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) under **Apps & Credentials** for that account (or the connected business account).

---

## Environment variables

### Frontend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_PAYPAL_CLIENT_ID` | Yes | Your PayPal app **Client ID** (from [developer.paypal.com](https://developer.paypal.com/dashboard/) → Apps & Credentials). Use **Sandbox** for testing, **Live** for production. |
| `VITE_PAYPAL_CURRENCY` | No | Currency for the order (default `EUR`). |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL (for Edge Functions). |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon key. |

### Backend (Supabase Edge Function secrets)

Set these in **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets** (or via `supabase secrets set`).

| Variable | Required | Description |
|----------|----------|-------------|
| `PAYPAL_CLIENT_ID` | Yes | Same Client ID as frontend (or the app’s Client ID). |
| `PAYPAL_CLIENT_SECRET` | Yes | The **Secret** for the same app (Sandbox or Live). Never expose this in the frontend. |
| `PAYPAL_CURRENCY` | No | Currency for created orders (default `EUR`). |
| `PAYPAL_SANDBOX` | No | Set to `true` to use PayPal Sandbox (for testing). Omit or `false` for live. |

---

## Flow

1. User fills amount, name, and optional words of support on your page.
2. When the form is valid, the **PayPal button** appears (fully styled on your site).
3. User clicks the PayPal button → PayPal popup/inline opens with the **exact amount** from your form.
4. After the user approves, your server **captures** the order and records the donation in the database.

No redirect to PayPal’s full checkout page; you control the surrounding layout and copy.

---

## Deploy Edge Functions

Create the pending-donations table and deploy the PayPal functions:

```bash
supabase db push
supabase functions deploy paypal-create-order
supabase functions deploy paypal-capture-order
```

Then set the secrets (see above).

---

## GitHub Pages (and other CI builds)

The repo builds the frontend on **GitHub Actions** and deploys to GitHub Pages. There is **no `.env` file on GitHub**; your local `.env` is never uploaded.

To have PayPal work on the **live site**, add the same value as a **repository secret**:

1. On GitHub: **Settings** → **Secrets and variables** → **Actions**.
2. Add a secret named **`VITE_PAYPAL_CLIENT_ID`** with your PayPal Client ID (same as in `.env` locally).

The workflow already passes this into the build, so the deployed app will get the client ID and the “PayPal is not configured” message will go away. If the secret is missing, the build will fail with a clear error so you know to add it.

---

## Guest checkout (pay by card without PayPal login)

- In your **PayPal account**: **Account settings** → **Website payments** → **Website preferences**.
- Turn **PayPal account optional** to **On**.

The SDK will then allow paying with a card without a PayPal account where supported.
