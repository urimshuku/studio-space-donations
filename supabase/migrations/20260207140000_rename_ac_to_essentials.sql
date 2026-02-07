/*
  # Rename A/C to Essentials and set goal €2000, current €500

  Updates the existing A/C category for existing databases.
*/

UPDATE categories
SET
  name = 'Essentials',
  description = 'Essential comforts for the space: heating, cooling, and basic amenities so everyone can work in comfort year-round.',
  target_amount = 2000,
  current_amount = 500,
  updated_at = now()
WHERE name = 'A/C';
