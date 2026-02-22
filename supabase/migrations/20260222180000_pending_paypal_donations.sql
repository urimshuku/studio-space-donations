-- Stores donation details keyed by PayPal order ID so we can record the donation after capture.
CREATE TABLE IF NOT EXISTS pending_paypal_donations (
  order_id text PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  amount numeric NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  words_of_support text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pending_paypal_donations ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (Edge Functions use service role).
CREATE POLICY "Service role only"
  ON pending_paypal_donations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE pending_paypal_donations IS 'Temporary store for PayPal JS SDK flow: order_id from PayPal, donation details to insert after capture.';
