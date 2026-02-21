import { Heart } from 'lucide-react';

interface HeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
  onGoHome?: () => void;
  onDonateNow?: () => void;
}

export function Header({ selectedTab, onTabChange, onGoHome, onDonateNow }: HeaderProps) {
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onTabChange('General Donations');
    onGoHome?.();
    window.scrollTo(0, 0);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
        <a
          href={`${import.meta.env.BASE_URL}`}
          className="flex-shrink-0"
          onClick={handleLogoClick}
          aria-label="Return to home"
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.svg?v=2`}
            alt="Studio Space Donations logo"
            className="h-14 sm:h-16 md:h-24 w-auto"
          />
        </a>
        {onDonateNow && (
          <button
            type="button"
            onClick={onDonateNow}
            className="flex items-center gap-1.5 sm:gap-2 text-white font-bold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-xl hover:scale-105 active:scale-100 flex-shrink-0"
            style={{ backgroundColor: '#c95b2d' }}
          >
            <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" aria-hidden />
            Donate Now
          </button>
        )}
      </div>
    </header>
  );
}
