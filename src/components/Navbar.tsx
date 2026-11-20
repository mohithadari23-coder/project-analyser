interface NavbarProps {
  hasResults: boolean;
  onScrollTo: (id: string) => void;
}

export function Navbar({ hasResults, onScrollTo }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-[#120624]/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            onScrollTo('hero');
          }}
          className="font-display text-lg sm:text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
        >
          AI Research Studio
        </a>

        {/* Zone 2: Concise single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400"
        >
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              onScrollTo('hero');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
          >
            Overview
          </a>
          <a
            href="#generator"
            onClick={(e) => {
              e.preventDefault();
              onScrollTo('generator');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
          >
            Generator
          </a>
          {hasResults && (
            <a
              href="#results"
              onClick={(e) => {
                e.preventDefault();
                onScrollTo('results');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
            >
              Results
            </a>
          )}
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              onScrollTo('features');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-sm"
          >
            Features
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => onScrollTo('generator')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-black rounded-lg bg-white hover:bg-zinc-200 active:scale-[0.98] transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Start Generating
          </button>
        </div>
      </div>
    </header>
  );
}
