interface HeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ selectedTab, onTabChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
        <a
          href="/"
          className="flex-shrink-0"
          onClick={(e) => {
            e.preventDefault();
            onTabChange('General Donations');
          }}
        >
          <img
            src="/logo.svg"
            alt="Studio Space Donations logo"
            className="h-16 sm:h-24 w-auto"
          />
        </a>
      </div>
    </header>
  );
}
