'use client';

export const ContestPoints = ({ points }: { points: number }) => {
  return (
    <main className="flex-1 rounded-lg px-4 shadow-md md:px-6 md:py-8">
      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div>{points} points</div>
      </div>
    </main>
  );
};
