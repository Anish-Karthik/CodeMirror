'use server';

import { db } from '@/lib/db';

export const isSlugAvailable = async (slug: string) => {
  const exists = await db.problem.findUnique({
    where: {
      slug,
    },
  });
  return !exists;
};
