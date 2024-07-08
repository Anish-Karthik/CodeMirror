import { getContest } from '@/lib/contest';
import { ContestClock } from './ContestClock';
import { ContestPoints } from './ContestPoints';
import { ContestProblemsTable } from './ContestProblemsTable';

export async function Contest({ id }: { id: string }) {
  const contest = await getContest(id);
  console.log(contest);
  console.log(id);

  if (!contest) {
    return <div>Contest not found</div>;
  }

  return (
    <div className="grid-cols grid min-h-screen grid-flow-row-dense grid-cols-1 gap-4 px-2 md:grid-cols-12 md:px-12">
      <div className="col-span-9">
        <ContestProblemsTable contest={contest} />
      </div>
      <div className="col-span-3">
        <div className="col-span-3 pt-2 md:pt-24">
          <ContestClock endTime={contest.endTime} />
        </div>
        <div className="pt-2">
          <ContestPoints
            points={contest.contestSubmissions.reduce(
              (acc, curr) => acc + curr.points,
              0
            )}
          />
        </div>
      </div>
    </div>
  );
}
