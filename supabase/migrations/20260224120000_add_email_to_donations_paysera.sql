-- Add email to donations (non-sensitive contact data only; no card/bank details).
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS email text;

COMMENT ON COLUMN donations.email IS 'Donor email (optional, for receipt/contact). Stored only after Paysera callback confirms payment.';

-- Add email to pending Paysera donations so we can pass p_email to Paysera and persist on callback.
ALTER TABLE pending_paysera_donations
  ADD COLUMN IF NOT EXISTS email text;
