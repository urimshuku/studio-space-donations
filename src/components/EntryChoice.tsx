import { useState, useCallback } from 'react';
import { EntryDotsCanvas } from './EntryDotsCanvas';

/**
 * Entry screen: choose Activities, Donations, or Venue.
 * Shows only the three logos (no cards), no header or footer.
 */
interface EntryChoiceProps {
  onChooseActivities: () => void;
  onChooseDonations: () => void;
  onChooseVenue: () => void;
  onBookNow?: () => void; // kept for API compatibility (unused here)
}

export function EntryChoice({ onChooseActivities, onChooseDonations, onChooseVenue }: EntryChoiceProps) {
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  }, []);
  const onMouseLeave = useCallback(() => {
    setMouse(null);
  }, []);

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const logoDonationsUrl = `${base}/logo.svg?v=2`;
  const logoActivitiesUrl = `${base}/logo-activities.svg`;
  const logoVenueUrl = `${base}/logo-venue.svg`;

  const logoClass = 'h-16 sm:h-20 md:h-24 w-auto object-contain flex-shrink-0';
  const logoButtonClass =
    'entry-card-animate flex items-center justify-center p-2 sm:p-4 bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400';

  return (
    <div
      className="relative h-screen overflow-hidden md:min-h-screen md:overflow-visible bg-gray-50"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <EntryDotsCanvas mouse={mouse} />
      <div className="relative z-10 flex h-full min-h-screen items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 sm:gap-14 md:gap-16 -mt-12 sm:-mt-16">
          <button
            type="button"
            onClick={onChooseVenue}
            className={logoButtonClass}
            aria-label="Go to Studio Space Venue"
          >
            <img src={logoVenueUrl} alt="Studio Space Venue" className={logoClass} />
          </button>
          <button
            type="button"
            onClick={onChooseActivities}
            className={logoButtonClass}
            aria-label="Go to Studio Space Activities"
          >
            <img src={logoActivitiesUrl} alt="Studio Space Activities" className={logoClass} />
          </button>
          <button
            type="button"
            onClick={onChooseDonations}
            className={logoButtonClass}
            aria-label="Go to Studio Space Donations"
          >
            <img src={logoDonationsUrl} alt="Studio Space Donations" className={logoClass} />
          </button>
        </div>
      </div>
    </div>
  );
}
