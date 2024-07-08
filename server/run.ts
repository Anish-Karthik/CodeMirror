import { SubmissionInput } from '@/common/zod';
import { getProblemForEvaluation } from '@/lib/code-evaluation';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { mergeRouters, protectedProcedure, router } from './trpc';
import {
  addUserCodeToBoilerplate,
  fetchSubmissions as fetchSubmissionsFromJudge0,
  submitToJudge0Wrapper,
} from './utils';
import { isAllFinished } from './utils/poll';

export const runApi = router({
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
        submissionInput.languageId,
        false
      );
      problem.fullBoilerplateCode = addUserCodeToBoilerplate(
        problem.fullBoilerplateCode,
        submissionInput.code
      );
      console.log(problem);
      if (problem.inputs.length === 0 || problem.outputs.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Testcases not found',
        });
      }

      const data: { token: string }[] = await submitToJudge0Wrapper({
        problem,
        languageId: submissionInput.languageId,
      });
      const tokens = data.map(({ token }) => token);
      console.log(tokens);
      return tokens;
    }),
  poll: protectedProcedure
    .input(z.array(z.string()))
    .query(async ({ input: tokens }) => {
      if (tokens.length === 0) {
        return {
          testcaseResults: [],
          allFinished: false,
        };
      }
      const testcases = await fetchSubmissionsFromJudge0(tokens ?? []);
      const allFinished = isAllFinished(testcases);
      return {
        testcaseResults: testcases,
        allFinished,
      };
    }),
});

export const runRouter = mergeRouters(runApi);
