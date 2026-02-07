/*
  # Seed initial categories

  Inserts the default categories so they show on the site.
  Uses ON CONFLICT so re-running is safe.
*/

INSERT INTO categories (name, description, target_amount, current_amount, sort_order, has_progress_bar)
VALUES
  ('General Donations', 'General support for our studio space. Every euro helps us keep the lights on and the space welcoming.', 0, 0, 0, false),
  ('Workshop Tables', 'Tables for workshops and collaborative work in the studio.', 500, 500, 1, true),
  ('Insulation', 'Help us insulate the studio to stay warm in winter and cool in summer.', 2500, 0, 2, true),
  ('Garden', 'Outdoor garden area for breaks and small events.', 500, 0, 3, true),
  ('Kitchen', 'Kitchen upgrade so we can host workshops and community meals.', 5000, 0, 4, true),
  ('Essentials', 'Essential comforts for the space: heating, cooling, and basic amenities so everyone can work in comfort year-round.', 2000, 0, 5, true)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  target_amount = EXCLUDED.target_amount,
  current_amount = EXCLUDED.current_amount,
  sort_order = EXCLUDED.sort_order,
  has_progress_bar = EXCLUDED.has_progress_bar,
  updated_at = now();
