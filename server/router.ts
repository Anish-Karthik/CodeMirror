import { createCallerFactory, publicProcedure, router } from '@/server/trpc';
import { contestRouter } from './contest';
import { problemRouter } from './problem';
import { runRouter } from './run';
import { submissionRouter } from './submission';
import { testcaseRouter } from './testcase';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
  test: publicProcedure.query(() => {
    return { message: 'Hello World' };
  }),
  dbTest: publicProcedure.query(({ ctx }) => {
    console.log(ctx.db);
    return ctx.db.user.findMany();
  }),
  problem: problemRouter,
  testcase: testcaseRouter,
  contest: contestRouter,
  submission: submissionRouter,
  runCode: runRouter,
});
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 *
 * @example
 *   const trpc = createCaller(createContext);
 *   const res = await trpc.post.all();
 *   ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
