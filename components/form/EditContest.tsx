'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { trpc } from '@/app/_trpc/client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { editContest } from '@/schemas/contest';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Contest } from '@prisma/client';
import { format } from 'date-fns';
import { TrashIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { default as toast } from 'react-hot-toast';
import { type z } from 'zod';
import { default as AddContestProblem } from '../AddContestProblem';
import { Input } from '../ui/input';

export const EditContest = ({ contest }: { contest: Contest }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = trpc.useUtils();
  const { data: toggle } = trpc.contest.gettogglehidden.useQuery(contest.id);

  const updateContest = trpc.contest.update.useMutation({
    onMutate: async (data) => {
      console.log('updateContest onMutate');
      // await utils.contest.getAll.cancel();
      // await utils.contest.getAll.refetch();
    },
  });
  const deleteContest = trpc.contest.removeContest.useMutation({
    onSuccess: () => {
      utils.contest.getAll.invalidate().catch(console.error);
      // .catch(console.error);
      console.log('deleteContest onSuccess');
    },
  });
  const togglePublish = trpc.contest.togglehidden.useMutation({
    onSuccess: async () => {
      //  await utils.problem.getAll.invalidate();
      await utils.contest.gettogglehidden.invalidate(contest.id);
      console.log('togglePublish onSuccess');
    },
  });
  const router = useRouter();
  const form = useForm<z.infer<typeof editContest>>({
    resolver: zodResolver(editContest),
    defaultValues: {
      id: contest.id,
      title: contest.title,
      description: contest.description ?? '',
      startTime: format(new Date(contest.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(contest.endTime), "yyyy-MM-dd'T'HH:mm"),
    },
  });
  const handleDelete = async () => {
    try {
      await deleteContest.mutateAsync(contest.id);

      toast.success('Problem deleted successfully');
      router.push('/problems');
      router.refresh();
    } catch (error) {
      const e = error as Error;
      console.error(error);
      toast.error('Failed to delete problem');
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  const handlepublish = async () => {
    console.log(toggle);
    try {
      await togglePublish.mutateAsync(contest.id);
      toast.success('updated successfully');
    } catch (e) {
      const error = e as Error;
      toast.error(error.message);
    }
  };
  const { isValid, isSubmitting } = form.formState;
  async function onSubmit(values: z.infer<typeof editContest>) {
    try {
      await updateContest.mutateAsync(values);
      toast.success('Contest updated successfully');
    } catch (e) {
      const error = e as Error;
      // TODO: Handle error
      console.error(error);
      console.log(error.message);
      toast.error(error.message);
    }
  }
  const title = form.watch('title');
  const [description, setDescription] = [
    form.watch('description'),
    (desc: string) => form.setValue('description', desc),
  ];
  const [startTime, setStartTime] = [
    form.watch('startTime'),
    (time: string) => form.setValue('startTime', time),
  ];
  const [endTime, setEndTime] = [
    form.watch('endTime'),
    (time: string) => form.setValue('endTime', time),
  ];
  console.log({ title, description, startTime, endTime });
  return (
    <main className="">
      <div className="flex w-full">
        <div className="container">
          <div className="my-2 flex justify-between">
            <h1 className="text-2xl font-bold">Edit Contest Details</h1>
            <div className="flex items-center gap-2">
              <Button
                className="bg-white"
                onClick={handlepublish}
                disabled={togglePublish.isPending}
              >
                {toggle ? (
                  <span className="text-green-500">Publish</span>
                ) : (
                  <span className="text-red-500">Unpublish</span>
                )}
              </Button>
              <button
                className="h-full rounded px-2 py-1 text-white hover:bg-red-600"
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                <TrashIcon className="h-5 w-5 text-red-400" />
              </button>
            </div>
            {isDeleteDialogOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-900">
                  <h2 className="text-xl font-bold">Delete Contest</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete this problem?
                  </p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDelete}>Delete</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 text-black dark:text-white"
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex w-full justify-end">
                  <Button className="" type="submit" disabled={isSubmitting}>
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </section>
        </div>
        <div className="container pb-2 pl-0">
          {' '}
          {/* max-h-[84vh] overflow-y-auto */}
          <div className="my-2">
            <h1 className="text-2xl font-bold">Problem Details</h1>
          </div>
          <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
            <div className="prose prose-stone dark:prose-invert">
              <AddContestProblem contestId={contest.id} />
            </div>
          </section>
          {/* <div className="prose lg:prose-xl">
                <MDEditor.Markdown source={`## ${title} \n`+description} className="!bg-transparent" style={{ whiteSpace: 'pre-wrap' }} />
              </div> */}
        </div>
      </div>
    </main>
  );
};
