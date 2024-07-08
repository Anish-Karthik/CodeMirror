'use client';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addContest } from '@/schemas/contest';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { type z } from 'zod';
import { DialogClose } from '../ui/dialog';

const AddContest = () => {
  const utils = trpc.useUtils();
  const createContest = trpc.contest.create.useMutation({
    onMutate: async (data) => {
      console.log('createContest onMutate');
      // await utils.problem.getAll.cancel();
      // await utils.problem.getAll.refetch();
    },
  });

  const form = useForm<z.infer<typeof addContest>>({
    resolver: zodResolver(addContest),
    defaultValues: {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
    },
  });

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof addContest>) {
    try {
      await createContest.mutateAsync(values);
      toast.success('Contest created successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to create contest');
    }
  }

  console.log(form.getValues());

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 text-black dark:text-white"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Contest name" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display title.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Sample Contest" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display slug.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  The time when the contest will start.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  The time when the contest will end.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {isValid ? (
            <DialogClose asChild>
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            </DialogClose>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              Submit
            </Button>
          )}
        </form>
      </Form>
    </div>
  );
};

export default AddContest;
