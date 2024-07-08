'use client';

import { useEffect, useState } from 'react';

import { parseClock } from '@/lib/time';

export const ContestClock = ({ endTime }: { endTime: Date }) => {
  const [currentTimeLeft, setCurrentTimeLeft] = useState(
    endTime.getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimeLeft((currentTimeLeft) =>
        Math.max(0, currentTimeLeft - 1000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex-1 rounded-lg px-4 shadow-md md:px-6 md:py-8">
      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
        {currentTimeLeft > 0 ? (
          <div>{parseClock(currentTimeLeft / 1000)}</div>
        ) : null}
      </div>
    </main>
  );
};
