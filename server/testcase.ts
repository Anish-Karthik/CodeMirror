import { z } from 'zod';
import { adminProcedure, protectedProcedure, router } from './trpc';

export const testcaseRouter = router({
  create: adminProcedure
    .input(
      z.object({
        input: z.object({
          input: z.string(),
          output: z.string(),
          problemId: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const testcase = await ctx.db.testcase.create({
        data: {
          ...input.input,
        },
      });
      return testcase;
    }),
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return ctx.db.testcase.findMany({
        where: {
          problemId: input,
        },
        orderBy: {
          id: 'asc',
        },
      });
    }),
  update: adminProcedure
    .input(
      z.object({
        input: z.object({
          id: z.string(),
          input: z.string(),
          output: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const testcase = await ctx.db.testcase.update({
        where: {
          id: input.input.id,
        },
        data: {
          ...input.input,
        },
      });
      return testcase;
    }),
  remove: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const testcase = await ctx.db.testcase.delete({
      where: {
        id: input,
      },
    });
    return testcase;
  }),
  //togglrhideen input id and boolean value
  toggleHidden: adminProcedure
    .input(
      z.object({
        id: z.string(),
        isHidden: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const testcase = await ctx.db.testcase.update({
        where: {
          id: input.id,
        },
        data: {
          isHidden: input.isHidden,
        },
      });
      return testcase;
    }),
});
