-- Stores donation details keyed by Paysera order ID for recording after callback.
CREATE TABLE IF NOT EXISTS pending_paysera_donations (
  order_id text PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  donor_name text NOT NULL,
  amount numeric NOT NULL,
  is_anonymous boolean NOT NULL DEFAULT false,
  words_of_support text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pending_paysera_donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON pending_paysera_donations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE pending_paysera_donations IS 'Temporary store for Paysera: order_id sent to Paysera, donation details to insert when callback confirms payment.';
