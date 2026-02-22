-- Update General Donations description to new copy.
UPDATE categories
SET description = 'General support for our space.',
    updated_at = now()
WHERE name = 'General Donations';
