# PayPal integration: verification checklist & customization

## Quick verification checklist

Use this to confirm everything is wired correctly.

### 1. Environment

- [ ] **Frontend** (`.env`): `VITE_PAYPAL_CLIENT_ID`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` set.
- [ ] **Supabase Edge Function secrets**: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` set; `PAYPAL_SANDBOX=true` for testing.
- [ ] **Database**: Migration `20260222180000_pending_paypal_donations.sql` applied (`supabase db push` or already run).
- [ ] **Functions deployed**: `paypal-create-order` and `paypal-capture-order` deployed (`supabase functions deploy paypal-create-order` and `paypal-capture-order`).

### 2. Flow test (Sandbox)

1. Open your app, pick a category, go to the donation page.
2. Enter amount (e.g. €10), name or “Donate anonymously”.
3. Confirm the **PayPal button** appears below the total.
4. Click the PayPal button → PayPal popup opens with the **same amount** (e.g. 10.00 EUR).
5. Log in with a **Sandbox** test account (create one in [developer.paypal.com](https://developer.paypal.com) → Sandbox → Accounts).
6. Complete the payment in the popup.
7. Popup closes, app shows the **success** page.
8. In Supabase: **Table Editor** → `donations` → new row with correct amount and category; `categories` → `current_amount` increased.

### 3. If something fails

| Symptom | Check |
|--------|--------|
| “PayPal is not configured” | `VITE_PAYPAL_CLIENT_ID` in `.env` and dev server restarted. |
| PayPal button never appears | Amount &gt; 0 and (name filled or anonymous checked); `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` set. |
| “Failed to create order” | Edge Function secrets (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`); function deployed; CORS (functions use `*`). |
| “Capture failed” | Same secrets; `pending_paypal_donations` table exists; capture function deployed. |
| Donation not in DB after success | Supabase logs for `paypal-capture-order`; confirm `order_id` exists in `pending_paypal_donations` when capture runs. |

---

## Customizing the PayPal checkout

You can customize the **button and SDK behavior** on your site. The popup/window that PayPal opens is controlled by PayPal; the options below affect what appears on **your** page and which funding options are offered.

### 1. Button style (layout, color, shape, label)

In `PaymentGateway.tsx`, the `PayPalButtons` component has a `style` prop. You can change:

```tsx
<PayPalButtons
  style={{
    layout: 'vertical',   // 'vertical' | 'horizontal'
    color: 'gold',        // 'gold' | 'blue' | 'silver' | 'white' | 'black'
    shape: 'rect',        // 'rect' | 'pill'
    label: 'paypal',      // 'paypal' | 'checkout' | 'buynow' | 'pay'
    height: 45,           // 25–55 (optional)
  }}
  // ... createOrder, onApprove, onError
/>
```

**Examples**

- Match your brand: `color: 'black'`, `shape: 'pill'`.
- Compact row: `layout: 'horizontal'`, `height: 40`.

### 2. Hide specific funding options (e.g. Pay Later)

In `PayPalScriptProvider` you can pass `disableFunding` so certain options don’t appear in the button set:

```tsx
<PayPalScriptProvider
  options={{
    clientId: PAYPAL_CLIENT_ID,
    currency: PAYPAL_CURRENCY,
    intent: 'capture',
    disableFunding: 'paylater,card',  // comma-separated: paylater, card, credit, etc.
  }}
>
```

To only show **PayPal** (no card in the same button group), you can use `disableFunding: 'card,credit'` (exact values depend on SDK version; check [PayPal JS SDK configuration](https://developer.paypal.com/sdk/js/configuration/)).

### 3. Language / locale

Set the locale so the SDK (and button) use the right language:

```tsx
<PayPalScriptProvider
  options={{
    clientId: PAYPAL_CLIENT_ID,
    currency: PAYPAL_CURRENCY,
    intent: 'capture',
    locale: 'en_GB',  // e.g. en_US, de_DE, fr_FR
  }}
>
```

### 4. Wrapper around the button

You control the **container** of the PayPal button. In `PaymentGateway.tsx` you have:

```tsx
<div className="pt-2">
  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Pay with PayPal</p>
  <PayPalScriptProvider ...>
    <PayPalButtons ... />
  </PayPalScriptProvider>
</div>
```

You can change the heading, add a border, background, or different spacing (e.g. `className="rounded-lg border border-gray-200 p-4"`) so the button area matches your design.

### 5. Success page URL (done)

On payment success, the app now sets the URL to `/success?paypal=1` and shows the success page. A refresh will still show the success page.

### 6. PayPal’s own popup/window

The **popup** or window that opens when the user clicks the button is controlled by PayPal (copy, layout, and branding). You cannot change that UI from your app. To influence how your **business** appears there, use your [PayPal Business profile](https://www.paypal.com/myaccount/profile/) (logo, business name).

---

## Summary

- **Verification**: Use the checklist and flow test above to confirm env, DB, functions, and full payment → success → donation in DB.
- **Customization**: Adjust `style`, `disableFunding`, and `locale` in `PaymentGateway.tsx`, and style the wrapper div; the rest of the checkout experience on your site is already under your control.
