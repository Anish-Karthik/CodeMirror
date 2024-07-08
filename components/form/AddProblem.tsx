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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addProblem } from '@/schemas/problem';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { type z } from 'zod';
import { DialogClose } from '../ui/dialog';

const AddProblem = () => {
  const utils = trpc.useUtils();
  const createProblem = trpc.problem.create.useMutation({
    onMutate: async (data) => {
      console.log('createProblem onMutate');
      // await utils.problem.getAll.cancel();
      // await utils.problem.getAll.refetch();
    },
  });
  const form = useForm<z.infer<typeof addProblem>>({
    resolver: zodResolver(addProblem),
    defaultValues: {
      title: '',
      difficulty: 'MEDIUM',
      slug: '',
    },
  });

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof addProblem>) {
    try {
      await createProblem.mutateAsync(values);
      toast.success('Problem created successfully');
    } catch (error) {
      const e = error as Error;
      console.error(error);
      console.log(e.message);
      toast.error(e?.message ?? 'Failed to create problem');
    }
  }
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
                  <Input placeholder="Problem name" {...field} />
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="CM123" {...field} />
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
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  This is your public display difficulty.
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

export default AddProblem;
