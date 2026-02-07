/*
  # Remove €500 from Essentials; add Workshop Tables as completed (€500/€500)

  - Set Essentials (or A/C) current_amount to 0
  - Insert Workshop Tables category (target 500, current 500 = completed)
  - Reassign any €500 donation from Essentials to Workshop Tables so Donors list is correct
*/

-- Add Workshop Tables first so we can reassign donations to it
INSERT INTO categories (name, description, target_amount, current_amount, sort_order, has_progress_bar)
VALUES ('Workshop Tables', 'Tables for workshops and collaborative work in the studio.', 500, 500, 1, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  target_amount = EXCLUDED.target_amount,
  current_amount = EXCLUDED.current_amount,
  sort_order = EXCLUDED.sort_order,
  has_progress_bar = EXCLUDED.has_progress_bar,
  updated_at = now();

-- Move the €500 donation from Essentials/A/C to Workshop Tables and ensure it shows as anonymous in Donors
UPDATE donations d
SET
  category_id = (SELECT id FROM categories WHERE name = 'Workshop Tables' LIMIT 1),
  donor_name = 'Anonymous',
  is_anonymous = true
FROM categories c
WHERE d.category_id = c.id
  AND c.name IN ('Essentials', 'A/C')
  AND d.amount = 500;

-- Now zero out Essentials (and A/C if it still exists)
UPDATE categories
SET current_amount = 0, updated_at = now()
WHERE name IN ('Essentials', 'A/C');

-- Specific causes order: Workshop Tables first (1), then Insulation, Garden, Kitchen, Essentials
UPDATE categories SET sort_order = 1, updated_at = now() WHERE name = 'Workshop Tables';
UPDATE categories SET sort_order = 2, updated_at = now() WHERE name = 'Insulation';
UPDATE categories SET sort_order = 3, updated_at = now() WHERE name = 'Garden';
UPDATE categories SET sort_order = 4, updated_at = now() WHERE name = 'Kitchen';
UPDATE categories SET sort_order = 5, updated_at = now() WHERE name = 'Essentials';
