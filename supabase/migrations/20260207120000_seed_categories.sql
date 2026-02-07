/*
  # Seed initial categories

  Inserts the default categories so they show on the site.
  Uses ON CONFLICT so re-running is safe.
*/

INSERT INTO categories (name, description, target_amount, current_amount, sort_order, has_progress_bar)
VALUES
  ('General Donations', 'General support for our studio space. Every euro helps us keep the lights on and the space welcoming.', 0, 0, 0, false),
  ('Insulation', 'Help us insulate the studio to stay warm in winter and cool in summer.', 2500, 0, 1, true),
  ('Garden', 'Outdoor garden area for breaks and small events.', 500, 0, 2, true),
  ('Kitchen', 'Kitchen upgrade so we can host workshops and community meals.', 5000, 0, 3, true),
  ('A/C', 'Air conditioning for a comfortable working environment year-round.', 1000, 0, 4, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  target_amount = EXCLUDED.target_amount,
  sort_order = EXCLUDED.sort_order,
  has_progress_bar = EXCLUDED.has_progress_bar,
  updated_at = now();
