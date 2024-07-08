import { db as prisma } from '@/lib/db';
import { getPoints } from '@/lib/points';
import type { Problem, Submission, submissions } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const updateTestcases = async (
  testcases: submissions[],
  db = prisma
) => {
  const updatedTestcases = await Promise.all(
    testcases.map(async ({ token, ...testcase }) => {
      return await db.submissions.update({
        where: {
          token: token!,
        },
        data: {
          ...testcase,
        },
      });
    })
  );
  return updatedTestcases;
};

export const rejectSubmission = async (submissionId: string, db = prisma) => {
  return await db.submission.update({
    where: {
      id: submissionId,
    },
    data: {
      status: 'REJECTED',
    },
    include: {
      problem: true,
    },
  });
};

export const isAllFinished = (testcases: submissions[]) => {
  return testcases.every((testcase) => testcase.finished_at !== null);
};

export const checkIsAllAC = (testcases: submissions[]) => {
  return testcases.every((testcase) => testcase.status_id === 3);
};

export const getSubmissionTokens = async (
  submissionId: string,
  db = prisma
) => {
  const tokens = await db.submissions.findMany({
    where: {
      submissionId,
    },
    select: {
      id: true,
      token: true,
    },
  });
  return tokens.map(({ token }) => token).filter((token) => token !== null);
};

export const getSubmission = async (submissionId: string, db = prisma) => {
  return await db.submission.findUnique({
    where: {
      id: submissionId,
    },
    include: {
      problem: true,
    },
  });
};

export const updateSubmission = async (submissionId: string, db = prisma) => {
  return await db.submission.update({
    where: {
      id: submissionId,
    },
    data: {
      status: 'AC',
    },
    include: {
      problem: true,
    },
  });
};

export const updateSolvedCount = async (
  submission: Submission & { problem: Problem },
  userId: string,
  db = prisma
) => {
  const userSubmissions = await db.submission.findMany({
    where: {
      userId,
      status: 'AC',
    },
  });
  if (userSubmissions.length === 1 && submission) {
    await db.problem
      .update({
        where: {
          id: submission.problemId,
        },
        data: {
          solved: {
            increment: 1,
          },
        },
      })
      .catch((err) => {
        console.log('Error updating solved count inside submission');
        console.log(err);
      });
  }
};

export const updateSubmissionStatus = async (
  submissionId: string,
  activeContestId: string | null,
  testcases: submissions[],
  userId: string,
  db = prisma
) => {
  const updatedTestcases = await updateTestcases(testcases, db);
  const allFinished = isAllFinished(updatedTestcases);
  let submission: (Submission & { problem: Problem }) | null = null;
  let isAllAC = false;

  if (allFinished) {
    isAllAC = checkIsAllAC(updatedTestcases);
    if (isAllAC) {
      submission = await getSubmission(submissionId, db);
      if (!submission) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Submission not found',
        });
      }
      if (submission.status !== 'PENDING') {
        return { updatedTestcases, isAllFinished: allFinished, isAllAC };
      }
      submission = await updateSubmission(submissionId, db);
      if (activeContestId) {
        await updateContestSubmission(submission, activeContestId, userId, db);
      }
      await updateSolvedCount(submission, userId, db);
    } else {
      submission = await rejectSubmission(submissionId, db);
    }
  }
  return { updatedTestcases, isAllFinished: allFinished, isAllAC };
};

export const updateContestSubmission = async (
  submission: Submission & { problem: Problem },
  activeContestId: string,
  userId: string,
  db = prisma
) => {
  const contest = await db.contest.findUnique({
    where: {
      id: activeContestId,
    },
  });
  if (contest && submission) {
    const points = await getPoints(
      submission.problem.difficulty,
      contest.startTime,
      submission.createdAt
    );
    const prevData = await db.contestSubmission.findUnique({
      where: {
        userId_problemId_contestId: {
          contestId: activeContestId,
          problemId: submission.problemId,
          userId,
        },
      },
    });
    if (!prevData || (prevData.points && prevData.points <= points)) {
      const contestSubmission = await db.contestSubmission.upsert({
        create: {
          contestId: activeContestId,
          submissionId: submission.id,
          problemId: submission.problemId,
          points,
          userId,
        },
        where: {
          userId_problemId_contestId: {
            contestId: activeContestId,
            problemId: submission.problemId,
            userId,
          },
        },
        update: {
          points: points,
        },
      });
      console.log('Contest submission created');
      console.log(contestSubmission);
    }
  }
};
