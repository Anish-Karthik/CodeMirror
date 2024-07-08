import { z } from 'zod';

export const addContest = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
  })
  .superRefine((data, context) => {
    const { startTime, endTime } = data;
    const currentTime = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start <= currentTime) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start time must be greater than the current time',
        path: ['startTime'],
      });
    }

    if (end <= start) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be greater than the start time',
        path: ['endTime'],
      });
    }
  });

export const editContest = z.object({
  id: z.string().min(2).max(50),
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(1000),
  startTime: z.string().min(2).max(50),
  endTime: z.string().min(2).max(50),
});
