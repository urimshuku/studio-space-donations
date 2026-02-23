import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
  PayPalHostedFieldsProvider,
  PayPalHostedField,
  usePayPalHostedFields,
} from '@paypal/react-paypal-js';
import type { Category } from '../lib/types';

interface PaymentGatewayProps {
  category: Category;
  onBack: () => void;
  onSuccess: () => void;
}

const PRESET_AMOUNTS = [10, 20, 50, 100];
const MAX_WORDS_OF_SUPPORT = 150;

/** Prefer value injected into index.html (bypasses Vite env); fallback to import.meta.env. */
function getPaypalClientId(): string {
  if (typeof window !== 'undefined' && (window as unknown as { __PAYPAL_CLIENT_ID__?: string }).__PAYPAL_CLIENT_ID__) {
    return String((window as unknown as { __PAYPAL_CLIENT_ID__?: string }).__PAYPAL_CLIENT_ID__).trim();
  }
  return String(import.meta.env.VITE_PAYPAL_CLIENT_ID ?? '').trim();
}

const PAYPAL_CURRENCY = String(import.meta.env.VITE_PAYPAL_CURRENCY ?? 'EUR').trim() || 'EUR';

function PayPalButtonWrapper({
  supabaseUrl,
  supabaseAnonKey,
  formDataRef,
  onSuccess,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  formDataRef: React.MutableRefObject<{ category_id: string; donor_name: string; amount: number; is_anonymous: boolean; words_of_support?: string }>;
  onSuccess: () => void;
}) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  if (isRejected) {
    return (
      <p className="text-sm text-red-600">
        Payment options could not load. Check VITE_PAYPAL_CLIENT_ID in .env and that scripts from paypal.com are not blocked.
      </p>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-[120px] flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">Loading payment options…</p>
      </div>
    );
  }

  return (
    <PayPalButtons
      style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
      createOrder={async () => {
        const d = formDataRef.current;
        if (!d || d.amount <= 0) throw new Error('Please select or enter an amount.');
        if (!d.donor_name && !d.is_anonymous) throw new Error('Please enter your name or check Donate anonymously.');
        const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/paypal-create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
          body: JSON.stringify({
            category_id: d.category_id,
            donor_name: d.donor_name,
            amount: d.amount,
            is_anonymous: d.is_anonymous,
            words_of_support: d.words_of_support,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to create order');
        return data.orderID;
      }}
      onApprove={async (data) => {
        if (!data.orderID) return;
        const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/paypal-capture-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
          body: JSON.stringify({ orderID: data.orderID }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || 'Capture failed');
        onSuccess();
        const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
        const successUrl = `${window.location.origin}${base}/success?paypal=1`;
        window.location.href = successUrl;
      }}
      onError={(err) => {
        console.error('PayPal error:', err);
        alert(err?.message || 'Payment failed. Please try again.');
      }}
    />
  );
}

/** Basic email validation for required contact email. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function HostedFieldsCardSection({
  supabaseUrl,
  supabaseAnonKey,
  formDataRef,
  onSuccess,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  formDataRef: React.MutableRefObject<{ category_id: string; donor_name: string; amount: number; is_anonymous: boolean; words_of_support?: string }>;
  onSuccess: () => void;
}) {
  const [cardholderName, setCardholderName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const createOrderFn = async (): Promise<string> => {
    const d = formDataRef.current;
    if (!d || d.amount <= 0) throw new Error('Please select or enter an amount.');
    if (!d.donor_name && !d.is_anonymous) throw new Error('Please enter your name or check Donate anonymously.');
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/paypal-create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({
        category_id: d.category_id,
        donor_name: d.donor_name,
        amount: d.amount,
        is_anonymous: d.is_anonymous,
        words_of_support: d.words_of_support,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || 'Failed to create order');
    return data.orderID;
  };

  const captureAndRedirect = async (orderID: string) => {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/paypal-capture-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseAnonKey}` },
      body: JSON.stringify({ orderID }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result?.error || 'Capture failed');
    onSuccess();
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    window.location.href = `${window.location.origin}${base}/success?paypal=1`;
  };

  return (
    <PayPalHostedFieldsProvider
      createOrder={createOrderFn}
      onError={(err) => {
        console.error('Hosted Fields error:', err);
        setSubmitDisabled(false);
        const msg = typeof err === 'object' && err && 'message' in err ? String((err as { message: string }).message) : 'Payment failed.';
        if (/additional|verification|compliance|risk/i.test(msg)) {
          setFieldError('PayPal requested additional verification. Please try again or use the PayPal button.');
        } else {
          setFieldError(msg);
        }
      }}
    >
      <HostedFieldsFormInner
        cardholderName={cardholderName}
        setCardholderName={setCardholderName}
        contactEmail={contactEmail}
        setContactEmail={setContactEmail}
        submitDisabled={submitDisabled}
        setSubmitDisabled={setSubmitDisabled}
        fieldError={fieldError}
        setFieldError={setFieldError}
        captureAndRedirect={captureAndRedirect}
      />
    </PayPalHostedFieldsProvider>
  );
}

function HostedFieldsFormInner({
  cardholderName,
  setCardholderName,
  contactEmail,
  setContactEmail,
  submitDisabled,
  setSubmitDisabled,
  fieldError,
  setFieldError,
  captureAndRedirect,
}: {
  cardholderName: string;
  setCardholderName: (v: string) => void;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  submitDisabled: boolean;
  setSubmitDisabled: (v: boolean) => void;
  fieldError: string | null;
  setFieldError: (v: string | null) => void;
  captureAndRedirect: (orderID: string) => Promise<void>;
}) {
  const hostedFields = usePayPalHostedFields();

  const handleSubmit = () => {
    setFieldError(null);
    const name = cardholderName.trim();
    if (!name) {
      setFieldError('Please enter the cardholder name.');
      return;
    }
    if (!contactEmail.trim()) {
      setFieldError('Please enter your email address.');
      return;
    }
    if (!isValidEmail(contactEmail)) {
      setFieldError('Please enter a valid email address.');
      return;
    }
    const cardFields = hostedFields?.cardFields;
    if (!cardFields || typeof cardFields.submit !== 'function') {
      setFieldError('Card form is not ready. Please wait and try again.');
      return;
    }
    setSubmitDisabled(true);
    cardFields
      .submit({
        cardholderName: name,
        // Intentionally omit billingAddress so we do not request address fields.
      })
      .then((response: { orderId?: string }) => {
        const orderID = response?.orderId;
        if (!orderID) throw new Error('No order ID returned from payment.');
        return captureAndRedirect(orderID);
      })
      .catch((err) => {
        console.error('Card submit error:', err);
        setSubmitDisabled(false);
        const msg = err?.message ?? (typeof err === 'string' ? err : 'Payment could not be completed.');
        if (/declined|INSTRUMENT_DECLINED/i.test(msg)) {
          setFieldError('Your card was declined. Please try another card or payment method.');
        } else if (/additional|verification|compliance|risk/i.test(msg)) {
          setFieldError('PayPal requested additional verification. Please try again or use the PayPal button.');
        } else {
          setFieldError(msg);
        }
      });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
      <p className="text-sm font-semibold text-gray-700">Pay with debit or credit card (no PayPal account)</p>
      {fieldError && (
        <p className="text-sm text-red-600" role="alert">
          {fieldError}
        </p>
      )}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email address <span className="text-red-500">*</span></label>
        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Name on card"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="cc-name"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Card number</label>
        <div id="hosted-field-card-number" className="min-h-[42px] rounded-lg border border-gray-300 bg-white" />
        <PayPalHostedField id="card-number" hostedFieldType="number" options={{ selector: '#hosted-field-card-number', placeholder: '4111 1111 1111 1111' }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Expiration</label>
          <div id="hosted-field-expiration" className="min-h-[42px] rounded-lg border border-gray-300 bg-white" />
          <PayPalHostedField id="expiration-date" hostedFieldType="expirationDate" options={{ selector: '#hosted-field-expiration', placeholder: 'MM/YY' }} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
          <div id="hosted-field-cvv" className="min-h-[42px] rounded-lg border border-gray-300 bg-white" />
          <PayPalHostedField id="cvv" hostedFieldType="cvv" options={{ selector: '#hosted-field-cvv', placeholder: '123' }} />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitDisabled}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: '#c95b2d' }}
      >
        {submitDisabled ? 'Processing…' : 'Pay with card'}
      </button>
    </div>
  );
}

function PaymentSectionWithHostedFields({
  supabaseUrl,
  supabaseAnonKey,
  formDataRef,
  formValid,
  amount,
  onSuccess,
  paypalClientId,
}: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  formDataRef: React.MutableRefObject<{ category_id: string; donor_name: string; amount: number; is_anonymous: boolean; words_of_support?: string }>;
  formValid: boolean;
  amount: number;
  onSuccess: () => void;
  paypalClientId: string;
}) {
  const [clientToken, setClientToken] = useState<string | null>(null);
  const [clientTokenError, setClientTokenError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setClientTokenError(null);
    const url = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/paypal-client-token`;
    fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${supabaseAnonKey}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setClientTokenError(data.error);
          return;
        }
        const token = data.client_token;
        if (token) setClientToken(token);
        else setClientTokenError('No client token returned.');
      })
      .catch((err) => {
        if (!cancelled) setClientTokenError(err?.message ?? 'Failed to load payment options.');
      });
    return () => { cancelled = true; };
  }, [supabaseUrl, supabaseAnonKey]);

  if (clientTokenError) {
    return (
      <div className="pt-2">
        <p className="text-sm text-red-600">
          Could not load card payment: {clientTokenError}. You can still use the PayPal button if it appears.
        </p>
      </div>
    );
  }

  if (!clientToken) {
    return (
      <div className="pt-2 min-h-[120px] flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">Loading payment options…</p>
      </div>
    );
  }

  return (
    <div className="pt-2">
      <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Pay with PayPal or debit/credit card (€{amount.toFixed(2)})</p>
      {!formValid && (
        <p className="text-sm text-amber-600 mb-2">Enter your name or check Donate anonymously, then use one of the options below to pay.</p>
      )}
      <div className="min-h-[120px] flex flex-col gap-4">
        <PayPalScriptProvider
          options={{
            clientId: paypalClientId,
            currency: PAYPAL_CURRENCY,
            intent: 'capture',
            dataClientToken: clientToken,
            components: 'buttons,hosted-fields',
          }}
        >
          <PayPalButtonWrapper
            supabaseUrl={supabaseUrl}
            supabaseAnonKey={supabaseAnonKey}
            formDataRef={formDataRef}
            onSuccess={onSuccess}
          />
          <p className="text-xs text-gray-600 mt-1">Or pay by card below — no PayPal account or billing address required.</p>
          <div className="mt-1">
            <HostedFieldsCardSection
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              formDataRef={formDataRef}
              onSuccess={onSuccess}
            />
          </div>
        </PayPalScriptProvider>
      </div>
    </div>
  );
}

export function PaymentGateway({ category, onBack, onSuccess }: PaymentGatewayProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [wordsOfSupport, setWordsOfSupport] = useState('');

  const amount = (selectedAmount ?? parseFloat(customAmount)) || 0;
  const formValid = amount > 0 && (!!donorName || isAnonymous);

  const formDataRef = useRef({
    category_id: category.id,
    donor_name: donorName,
    amount,
    is_anonymous: isAnonymous,
    words_of_support: wordsOfSupport.trim().slice(0, MAX_WORDS_OF_SUPPORT) || undefined,
  });
  useEffect(() => {
    formDataRef.current = {
      category_id: category.id,
      donor_name: isAnonymous ? 'Anonymous' : donorName,
      amount,
      is_anonymous: isAnonymous,
      words_of_support: wordsOfSupport.trim().slice(0, MAX_WORDS_OF_SUPPORT) || undefined,
    };
  }, [category.id, donorName, isAnonymous, wordsOfSupport, amount]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const PAYPAL_CLIENT_ID = getPaypalClientId();
  if (!PAYPAL_CLIENT_ID) {
    return (
      <div className="max-w-2xl mx-auto px-1 sm:px-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Back to Home
        </button>
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
          <p className="text-gray-600 mb-2">
            PayPal is not configured.
          </p>
          <p className="text-sm text-gray-600">
            Add this line to your <code className="bg-gray-100 px-1 rounded">.env</code> file (create it from <code className="bg-gray-100 px-1 rounded">.env.example</code> if needed):
          </p>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">VITE_PAYPAL_CLIENT_ID=your_client_id_here</pre>
          <p className="text-sm text-gray-600 mt-2">
            Get your Client ID from <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">developer.paypal.com</a> → Apps &amp; Credentials. Put <code className="bg-gray-100 px-1 rounded">.env</code> in the project root (same folder as <code className="bg-gray-100 px-1 rounded">package.json</code>). No spaces around <code className="bg-gray-100 px-1 rounded">=</code>. Then restart the dev server (<code className="bg-gray-100 px-1 rounded">npm run dev</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        Back to Home
      </button>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-gray-100">
        <div className="mb-5 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Support {category.name}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">{category.description}</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Select Amount
            </label>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(preset);
                    setCustomAmount('');
                  }}
                  className={`py-3 sm:py-4 px-2 sm:px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 ${
                    selectedAmount === preset
                      ? 'text-white shadow-md scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor:
                      selectedAmount === preset ? '#c95b2d' : undefined,
                  }}
                >
                  €{preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm sm:text-base">
                €
              </span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="Other amount"
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ '--tw-ring-color': '#c95b2d', fontSize: '16px' } as React.CSSProperties}
                min="1"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              disabled={isAnonymous}
              placeholder="Enter your name"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
              style={{ fontSize: '16px' }}
            />
            <label className="flex items-center gap-2 mt-1.5 sm:mt-2">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-xs sm:text-sm text-gray-600">Donate anonymously</span>
            </label>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              Words of Support <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <textarea
              value={wordsOfSupport}
              onChange={(e) => setWordsOfSupport(e.target.value.slice(0, MAX_WORDS_OF_SUPPORT))}
              placeholder="Leave a short message in support of the space"
              maxLength={MAX_WORDS_OF_SUPPORT}
              rows={3}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              style={{ fontSize: '16px' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              {wordsOfSupport.length}/{MAX_WORDS_OF_SUPPORT} characters
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
              <span className="text-gray-600">Donation Amount:</span>
              <span className="font-semibold text-gray-900">€{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl sm:text-2xl font-bold" style={{ color: '#c95b2d' }}>€{amount.toFixed(2)}</span>
            </div>
          </div>

          {amount > 0 && supabaseUrl && supabaseAnonKey && (
            <PaymentSectionWithHostedFields
              supabaseUrl={supabaseUrl}
              supabaseAnonKey={supabaseAnonKey}
              formDataRef={formDataRef}
              formValid={formValid}
              amount={amount}
              onSuccess={onSuccess}
              paypalClientId={PAYPAL_CLIENT_ID}
            />
          )}

          {amount > 0 && (!supabaseUrl || !supabaseAnonKey) && (
            <p className="text-sm text-amber-600">Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable checkout.</p>
          )}

          {amount <= 0 && (
            <p className="text-sm text-gray-500 text-center">Select or enter an amount above to see payment options.</p>
          )}

          <p className="text-xs text-center text-gray-500">
            Payments secured by PayPal. Your donation will be processed securely.
          </p>
        </div>
      </div>
    </div>
  );
}
