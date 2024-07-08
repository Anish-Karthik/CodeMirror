import { db } from '../db';

export async function generateLeaderboard(contestId: string) {
  const userPoints = new Map<string, number>();
  const contestSubmissions = await db.contestSubmission.findMany({
    where: {
      contestId: contestId,
    },
    include: {
      user: true,
    },
  });

  contestSubmissions.forEach((submission) => {
    if (userPoints.has(submission.userId)) {
      userPoints.set(
        submission.userId,
        userPoints.get(submission.userId)! + submission.points
      );
    } else {
      userPoints.set(submission.userId, submission.points);
    }
  });

  const sortedUserPoints = Array.from(userPoints.entries()).sort(
    (a, b) => b[1] - a[1]
  );

  // clean existing leaderboard

  await db.contest.update({
    where: {
      id: contestId,
    },
    data: {
      leaderboard: false,
    },
  });

  await db.contestPoints.deleteMany({
    where: {
      contestId: contestId,
    },
  });

  const data = await db.contestPoints.createMany({
    data: sortedUserPoints.map(([userId, points]) => ({
      userId,
      points: points,
      contestId: contestId,
      rank: sortedUserPoints.map((x) => x[0]).indexOf(userId) + 1,
    })),
  });
  console.log(data);

  await db.contest.update({
    where: {
      id: contestId,
    },
    data: {
      leaderboard: true,
    },
  });
}
