/**
 * Entry screen: choose Activities, Donations, or Venue.
 * Shows only three large cards, no header or footer.
 */
interface EntryChoiceProps {
  onChooseActivities: () => void;
  onChooseDonations: () => void;
  onChooseVenue: () => void;
  onBookNow?: () => void; // kept for API compatibility (unused here)
}

export function EntryChoice({ onChooseActivities, onChooseDonations, onChooseVenue }: EntryChoiceProps) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const logoDonationsUrl = `${base}/logo.svg?v=2`;
  const logoActivitiesUrl = `${base}/logo-activities.svg`;
  const logoVenueUrl = `${base}/logo-venue.svg`;

  const cardClass =
    'entry-card-animate flex flex-col items-center justify-center min-h-[120px] sm:min-h-[240px] md:min-h-[280px] p-4 sm:p-8 md:p-12 bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-md transition-all duration-200 hover:shadow-xl hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400 text-gray-900';
  const logoClass = 'h-16 sm:h-20 md:h-24 w-auto object-contain flex-shrink-0';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Mobile: horizontal scroll row; md+: 3-column grid */}
      <div className="w-full max-w-5xl flex flex-row overflow-x-auto gap-4 pb-2 md:overflow-visible md:flex-none md:grid md:grid-cols-3 md:gap-8 snap-x snap-mandatory md:snap-none">
        <button
          type="button"
          onClick={onChooseVenue}
          className={`${cardClass} flex-shrink-0 min-w-[200px] md:min-w-0 snap-center`}
          aria-label="Go to Studio Space Venue"
        >
          <img src={logoVenueUrl} alt="Studio Space Venue" className={logoClass} />
        </button>

        <button
          type="button"
          onClick={onChooseActivities}
          className={`${cardClass} flex-shrink-0 min-w-[200px] md:min-w-0 snap-center`}
          aria-label="Go to Studio Space Activities"
        >
          <img src={logoActivitiesUrl} alt="Studio Space Activities" className={logoClass} />
        </button>

        <button
          type="button"
          onClick={onChooseDonations}
          className={`${cardClass} flex-shrink-0 min-w-[200px] md:min-w-0 snap-center`}
          aria-label="Go to Studio Space Donations"
        >
          <img src={logoDonationsUrl} alt="Studio Space Donations" className={logoClass} />
        </button>
      </div>
    </div>
  );
}
