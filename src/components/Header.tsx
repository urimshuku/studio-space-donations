import { Heart, Calendar, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  onGoHome?: () => void;
  onDonateNow?: () => void;
  /** When provided, show black "Book now" button with calendar icon (e.g. on entry page) */
  onBookNow?: () => void;
  /** When provided, show subtle back arrow under logo that navigates to entry page */
  onBackToEntry?: () => void;
  /**
   * Logo variant:
   * - 'donations' → Studio Space Donations logo
   * - 'activities' → Studio Space Activities logo
   * - 'entry' → Studio Space (no donations)
   * - 'venue' → Studio Space Venue logo
   */
  logoVariant?: 'donations' | 'activities' | 'entry' | 'venue';
}

const LOGO_URLS: Record<NonNullable<HeaderProps['logoVariant']>, string> = {
  donations: 'logo.svg?v=2',
  activities: 'logo-activities.svg',
  entry: 'logo-entry.svg',
  venue: 'logo-venue.svg',
};

export function Header({ selectedTab, onTabChange, onGoHome, onDonateNow, onBookNow, onBackToEntry, logoVariant = 'donations' }: HeaderProps) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const logoUrl = `${base}/${LOGO_URLS[logoVariant]}`;
  const logoAlt =
    logoVariant === 'activities'
      ? 'Studio Space Activities logo'
      : logoVariant === 'entry'
        ? 'Studio Space logo'
        : logoVariant === 'venue'
          ? 'Studio Space Venue logo'
          : 'Studio Space Donations logo';

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onTabChange('General Donations');
    onGoHome?.();
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex flex-col items-start gap-0.5 sm:gap-1">
          <a
            href={base || '/'}
            className="flex-shrink-0"
            onClick={handleLogoClick}
            aria-label="Return to home"
          >
            <img
              src={logoUrl}
              alt={logoAlt}
              className={`h-14 sm:h-16 md:h-24 w-auto ${logoVariant === 'entry' ? 'object-contain object-[center_30%]' : ''}`}
            />
          </a>
          {onBackToEntry && (
            <button
              type="button"
              onClick={() => {
                onBackToEntry();
                window.scrollTo(0, 0);
              }}
              className="flex items-center text-gray-400 hover:text-gray-700 text-xs sm:text-sm transition-colors mt-0.5"
              aria-label="Back to Studio Space"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {onBookNow && (
            <button
              type="button"
              onClick={onBookNow}
              className="flex items-center gap-1.5 sm:gap-2 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 active:scale-100"
              style={{ backgroundColor: '#d5a220' }}
              aria-label="Book Now"
            >
              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-white text-white" aria-hidden />
              Book Now
            </button>
          )}
          {onDonateNow && (
            <button
              type="button"
              onClick={onDonateNow}
              className="flex items-center gap-1.5 sm:gap-2 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 active:scale-100"
              style={{ backgroundColor: '#c95b2d' }}
              aria-label="Donate now"
            >
              <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" aria-hidden />
              Donate Now
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
