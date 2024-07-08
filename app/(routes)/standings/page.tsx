import { PrimaryButton } from '@/components/LinkButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getContestsWithLeaderboard } from '@/lib/contest';

export default async function Page() {
  const contests = await getContestsWithLeaderboard();

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-md flex-col p-4">
      <div className="container px-4 md:px-6">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold">Leaderboard</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Check out the leaderboard
          </p>
        </div>
      </div>
      <div>
        <ContestsTable contests={contests} />
      </div>
    </div>
  );
}

interface IContest {
  id: string;
  title: string;
  startTime: Date;
}

function ContestsTable({ contests }: { contests: IContest[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Contest Name</TableHead>
            <TableHead>Start time</TableHead>
            <TableHead>Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contests.map((contest) => (
            <TableRow key={`standings-${contest.id}`}>
              <TableCell>{contest.id.substring(0, 8)}</TableCell>
              <TableCell>{contest.title}</TableCell>
              <TableCell>{contest.startTime.toLocaleString()}</TableCell>
              <TableCell>
                <PrimaryButton href={`/standings/${contest.id}`}>
                  View
                </PrimaryButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
