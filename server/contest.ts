import { addContest, editContest } from '@/schemas/contest';
import { z } from 'zod';
import { adminProcedure, publicProcedure, router } from './trpc';

export const contestRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    // if (ctx.session.user.role === 'ADMIN')
    return ctx.db.contest.findMany();
    // return getProblems();
  }),
  get: adminProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return ctx.db.contest.findUnique({
      where: {
        id: input,
      },
    });
  }),
  create: adminProcedure.input(addContest).mutation(async ({ input, ctx }) => {
    const contest = await ctx.db.contest.create({
      data: {
        ...input,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
      },
    });
    return contest;
  }),
  update: adminProcedure
    .input(editContest)
    .mutation(async ({ input: { id, ...input }, ctx }) => {
      const contest = await ctx.db.contest.update({
        where: {
          id,
        },
        data: {
          ...input,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
        },
      });
      return contest;
    }),
  addProblems: adminProcedure
    .input(
      z.object({
        contestId: z.string(),
        problemIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log(input);
      const contestProblems = await Promise.all(
        input.problemIds.map(async (problemId, index) => {
          return await ctx.db.contestProblem.create({
            data: {
              contestId: input.contestId,
              problemId,
              index,
            },
          });
        })
      );

      console.log(contestProblems);
    }),
  getContestProblems: adminProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return ctx.db.contestProblem.findMany({
        where: {
          contestId: input,
        },
        include: {
          problem: true,
        },
        orderBy: {
          index: 'asc',
        },
      });
    }),
  removeProblem: adminProcedure
    .input(
      z.object({
        contestId: z.string(),
        problemId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.contestProblem.deleteMany({
        where: {
          contestId: input.contestId,
          problemId: input.problemId,
        },
      });
    }),
  removeContest: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      await ctx.db.contest.delete({
        where: {
          id: input,
        },
      });
    }),
  gettogglehidden: adminProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.contest.findUnique({
        where: {
          id: input,
        },
        select: { hidden: true },
      });
      if (!res) {
        throw new Error('Problem not found');
      }
      return res.hidden;
    }),
  togglehidden: adminProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const res = await ctx.db.contest.findUnique({
        where: {
          id: input,
        },
        select: { hidden: true },
      });
      console.log(res);
      if (!res) {
        throw new Error('Problem not found');
      }
      const contest = await ctx.db.contest.update({
        where: {
          id: input,
        },
        data: {
          hidden: !res.hidden,
        },
      });
      return contest;
    }),
});
