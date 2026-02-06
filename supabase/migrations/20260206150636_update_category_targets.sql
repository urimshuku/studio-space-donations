/*
  # Update Category Targets and Add Flags

  1. Changes
    - Update target amounts for categories to match requirements
    - Add has_progress_bar column to control progress bar display
    - General Donations: no progress bar, no target amount
    - Insulation: €2,500 target
    - Garden: €500 target
    - Kitchen: €5,000 target
    - A/C: €1,000 target

  2. Data Updates
    - Update existing categories with correct targets
    - Set has_progress_bar=false for General Donations
    - Set has_progress_bar=true for other categories
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'has_progress_bar'
  ) THEN
    ALTER TABLE categories ADD COLUMN has_progress_bar boolean DEFAULT true;
  END IF;
END $$;

UPDATE categories SET 
  target_amount = 0,
  has_progress_bar = false,
  current_amount = 0
WHERE name = 'General Donations';

UPDATE categories SET
  target_amount = 2500,
  has_progress_bar = true,
  current_amount = 0
WHERE name = 'Insulation';

UPDATE categories SET
  target_amount = 500,
  has_progress_bar = true,
  current_amount = 0
WHERE name = 'Garden';

UPDATE categories SET
  target_amount = 5000,
  has_progress_bar = true,
  current_amount = 0
WHERE name = 'Kitchen';

UPDATE categories SET
  target_amount = 1000,
  has_progress_bar = true,
  current_amount = 0
WHERE name = 'A/C';