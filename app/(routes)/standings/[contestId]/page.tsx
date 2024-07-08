import { ContestPointsTable } from '@/components/ContestPointsTable';
import { getContestPoints } from '@/lib/contestPoints';

export default async function Page({
  params: { contestId },
}: {
  params: {
    contestId: string;
  };
}) {
  const { contestPoints, myPoints } = await getContestPoints(contestId, 1, 10);
  console.log(contestPoints);

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-md flex-col p-4">
      <div className="flex min-h-screen flex-col">
        <div className="container px-4 md:px-6">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">Leaderboard</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Check out the leaderboard
            </p>
          </div>
          <div className="rounded-lg bg-white shadow-md dark:bg-gray-900">
            <div className="prose prose-stone dark:prose-invert">
              <ContestPointsTable contestPoints={contestPoints} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
