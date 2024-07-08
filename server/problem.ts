import { generateDefaultCodes } from '@/lib/boilerplate-generator';
import { getProblems } from '@/lib/problem';
import { addProblem, editProblem } from '@/schemas/problem';
import { z } from 'zod';
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from './trpc';

export const problemRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (ctx.session?.user?.role === 'ADMIN') return ctx.db.problem.findMany();
    return getProblems();
  }),
  get: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return ctx.db.problem.findUnique({
      where: {
        id: input,
      },
    });
  }),
  create: adminProcedure.input(addProblem).mutation(async ({ input, ctx }) => {
    const problem = await ctx.db.problem.create({
      data: {
        ...input,
      },
    });
    return problem;
  }),
  update: adminProcedure
    .input(editProblem)
    .mutation(async ({ input: { id, ...input }, ctx }) => {
      console.log(input);
      try {
        await generateDefaultCodes({
          structure: input.structure,
          problemId: id,
        });
        const problem = await ctx.db.problem.update({
          where: {
            id,
          },
          data: {
            ...input,
          },
        });
        return problem;
      } catch (e) {
        const { structure, ...rest } = input;
        try {
          await ctx.db.problem.update({
            where: {
              id,
            },
            data: {
              ...rest,
            },
          });
          console.log(e);
        } catch (error) {
          throw new Error('Error updating problem');
        }
        throw new Error('Invalid problem structure');
      }
    }),
  remove: adminProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const problem = await ctx.db.problem.delete({
      where: {
        id: input,
      },
    });
    return problem;
  }),

  gettogglehidden: adminProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const res = await ctx.db.problem.findUnique({
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
      const problem = await ctx.db.problem.findUnique({
        where: {
          id: input,
        },
        select: { hidden: true },
      });

      if (!problem) {
        throw new Error('Problem not found');
      }

      const updateproblem = await ctx.db.problem.update({
        where: {
          id: input,
        },
        data: {
          hidden: !problem.hidden,
        },
      });
      return updateproblem;
    }),
  getPublicTestcases: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return ctx.db.testcase.findMany({
        where: {
          problemId: input,
          isHidden: false,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }),
});
