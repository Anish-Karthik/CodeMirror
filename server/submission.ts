import { SubmissionInput } from '@/common/zod';
import { getProblemForEvaluation } from '@/lib/code-evaluation';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { mergeRouters, protectedProcedure, router } from './trpc';
import {
  addUserCodeToBoilerplate,
  fetchSubmissions,
  submitToJudge0Wrapper,
} from './utils';
import {
  checkIsAllAC,
  getSubmissionTokens,
  isAllFinished,
  updateSubmissionStatus,
  updateTestcases,
} from './utils/poll';

export const submissionApi = router({
  getTestcases: protectedProcedure
    .input(z.string())
    .query(async ({ input: submissionId, ctx }) => {
      return await ctx.db.submissions.findMany({
        where: {
          submissionId,
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    }),
  get: protectedProcedure
    .input(z.string())
    .query(async ({ input: id, ctx }) => {
      return await ctx.db.submission.findUnique({
        where: {
          id,
        },
      });
    }),
  getAll: protectedProcedure
    .input(z.string())
    .query(async ({ input: problemId, ctx }) => {
      return await ctx.db.submission.findMany({
        where: {
          problemId,
        },
        include: {
          testcases: {
            orderBy: {
              created_at: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }),
  getAllByUser: protectedProcedure
    .input(z.string())
    .query(async ({ input: problemId, ctx }) => {
      return await ctx.db.submission.findMany({
        where: {
          problemId,
          userId: ctx.session.user.id,
        },
        include: {
          testcases: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
});

export const submitRouter = router({
  submit: protectedProcedure
    .input(SubmissionInput)
    .mutation(async ({ input: submissionInput, ctx }) => {
      const dbProblem = await ctx.db.problem.findUnique({
        where: {
          id: submissionInput.problemId,
        },
      });
      console.log(submissionInput);

      if (!dbProblem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Problem not found',
        });
      }

      const problem = await getProblemForEvaluation(
        dbProblem,
        submissionInput.languageId
      );
      if (problem.inputs.length === 0 || problem.outputs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testcases not found',
        });
      }
      problem.fullBoilerplateCode = addUserCodeToBoilerplate(
        problem.fullBoilerplateCode,
        submissionInput.code
      );

      const data: { token: string }[] = await submitToJudge0Wrapper({
        problem,
        languageId: submissionInput.languageId,
      });

      const submission = await ctx.db.submission.create({
        data: {
          userId: ctx.session.user.id,
          problemId: submissionInput.problemId,
          code: submissionInput.code,
          activeContestId: submissionInput.activeContestId,
          testcases: {
            create: data.map(({ token }) => ({
              token,
            })),
          },
        },
        include: {
          testcases: true,
        },
      });
      console.log(submission);
      return submission;
    }),
});

export const pollSubmissionRouter = router({
  poll: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        activeContestId: z.string().nullish(),
      })
    )
    .query(async ({ input: { submissionId, activeContestId }, ctx }) => {
      const tokens = await getSubmissionTokens(submissionId);
      const submissions = await fetchSubmissions(tokens ?? []);
      const updatedTestcases = await updateTestcases(submissions);
      const allFinished = isAllFinished(updatedTestcases);
      const allAC = checkIsAllAC(updatedTestcases);
      const result = await updateSubmissionStatus(
        submissionId,
        activeContestId ?? null,
        updatedTestcases,
        ctx.session.user.id
      );
      console.log(result);
      return {
        updatedTestcases: result.updatedTestcases,
        isAllFinished: allFinished,
        isAllAC: allAC,
      };
    }),
});

export const submissionRouter = mergeRouters(
  submissionApi,
  submitRouter,
  pollSubmissionRouter
);
