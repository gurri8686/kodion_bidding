'use client';

import NotificationBell from './NotificationBell';

const GlobalHeader = ({ title = 'Dashboard' }: { title?: string }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      {/* Left side - Page Title */}
      <div className="flex items-center justify-center lg:justify-start gap-2 sm:gap-4 flex-1 min-w-0">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
          {title}
        </h1>
      </div>

      {/* Right side - Notification Bell */}
      <div className="flex items-center flex-shrink-0">
        <NotificationBell />
      </div>
    </header>
  );
};

export default GlobalHeader;
