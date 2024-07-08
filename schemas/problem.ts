import { isSlugAvailable } from '@/server/actions/problem';
import { Difficulty } from '@prisma/client';
import { z } from 'zod';

export const addProblem = z.object({
  title: z.string().min(2).max(50),
  slug: z
    .string()
    .min(2)
    .max(50)
    .refine(
      async (slug) => {
        return isSlugAvailable(slug);
      },
      { message: 'Slug already exists' }
    ),
  difficulty: z.nativeEnum(Difficulty),
});

export const editProblem = z.object({
  id: z.string(),
  title: z.string().min(2).max(50),
  slug: z.string().min(2).max(50), // add super refine
  difficulty: z.nativeEnum(Difficulty),
  description: z.string().min(2).max(1000),
  structure: z.string().min(2).max(1000),
});
