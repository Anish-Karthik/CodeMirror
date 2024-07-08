import { currentUser } from '@/lib/auth';
import { getExistingContests, getUpcomingContests } from '@/lib/contest';
import { ContestCard } from './ContestCard';
import { default as AddContest } from './form/AddContest';
import { default as DialogModel } from './modal';
import { Button } from './ui/button';

export async function Contests() {
  const [user] = await Promise.all([currentUser()]);
  const isAdmin = user?.role === 'ADMIN';
  const [upcomingContests, pastContests] = await Promise.all([
    getUpcomingContests(isAdmin),
    getExistingContests(isAdmin),
  ]);
  return (
    <div className="min-h-screen">
      <section className="bg-white py-8 dark:bg-gray-900 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6">
            <div className="flex w-full justify-between">
              <h2 className="mb-2 text-2xl font-bold">Upcoming Contests</h2>
              {isAdmin && (
                <DialogModel
                  title="Add Problem"
                  trigger={
                    <Button variant={'outline'} elementType="div">
                      Add Contests
                    </Button>
                  }
                >
                  <AddContest />
                </DialogModel>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              Check out the upcoming programming contests on{' '}
              {process.env.NEXT_PUBLIC_APP_NAME}.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingContests.map((contest) => (
              <ContestCard
                key={contest.id}
                title={contest.title}
                id={contest.id}
                startTime={contest.startTime}
                endTime={contest.endTime}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-white py-8 dark:bg-gray-900 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold">Previous Contests</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Check out the previous programming contests on{' '}
              {process.env.NEXT_PUBLIC_APP_NAME}.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pastContests.map((contest) => (
              <ContestCard
                key={contest.id}
                title={contest.title}
                id={contest.id}
                startTime={contest.startTime}
                endTime={contest.endTime}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
