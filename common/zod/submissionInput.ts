import { SUPPORTED_LANGS } from '@/types';
import { z } from 'zod';

export const SubmissionInput = z.object({
  code: z.string(),
  languageId: z.nativeEnum(SUPPORTED_LANGS),
  problemId: z.string(),
  activeContestId: z.string().nullish(),
  // token: z.string(),
});
