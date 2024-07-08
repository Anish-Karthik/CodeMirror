import { auth } from '@/auth';
import { db } from '@/lib/db';
import { generateLeaderboard } from './leaderboard-generator';

export const getContest = async (contestId: string) => {
  const session = await auth();
  console.log(session);
  console.log(contestId);
  const contest = await db.contest.findFirst({
    where: {
      id: contestId,
      hidden: false,
    },
    include: {
      problems: {
        include: {
          problem: true,
        },
      },
      contestSubmissions: {
        where: {
          userId: session?.user?.id,
        },
      },
    },
  });
  console.log(contest);
  return contest;
};

export const getContestsWithLeaderboard = async () => {
  const contestWithoutLeaderboard = await db.contest.findMany({
    orderBy: {
      startTime: 'desc',
    },
  });
  const contests = await Promise.all(
    contestWithoutLeaderboard.map(async (contest) => {
      if (contest.leaderboard) {
        return contest;
      }
      await generateLeaderboard(contest.id);
      return contest;
    })
  );
  return contests ?? [];
};

export const getUpcomingContests = async (isAdmin?: boolean) => {
  if (isAdmin) {
    const contests = await db.contest.findMany({
      where: {
        endTime: {
          gt: new Date(),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    return contests;
  }
  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      endTime: {
        gt: new Date(),
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });
  return contests;
};

export const getExistingContests = async (isAdmin?: boolean) => {
  if (isAdmin) {
    const contests = await db.contest.findMany({
      where: {
        endTime: {
          lt: new Date(),
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    return contests;
  }
  const contests = await db.contest.findMany({
    where: {
      hidden: false,
      endTime: {
        lt: new Date(),
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  });
  return contests;
};
