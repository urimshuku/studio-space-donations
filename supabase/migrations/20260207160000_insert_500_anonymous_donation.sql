/*
  # Insert the €500 anonymous donation so it shows in the Donors list

  Run this only if the donation was never recorded (e.g. no Stripe webhook).
  Uses the category named 'Essentials' (or 'A/C').
*/

INSERT INTO donations (category_id, donor_name, amount, is_anonymous)
SELECT id, 'Anonymous', 500, true
FROM categories
WHERE name IN ('Essentials', 'A/C')
LIMIT 1;

-- Update the category's current_amount so the progress bar is correct
UPDATE categories
SET current_amount = COALESCE(current_amount, 0) + 500,
    updated_at = now()
WHERE name IN ('Essentials', 'A/C');
