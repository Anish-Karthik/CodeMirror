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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { editProblem } from '@/schemas/problem';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Problem } from '@prisma/client';
import { default as MDEditor } from '@uiw/react-md-editor';
import { TrashIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { type z } from 'zod';
import { ProblemStatement } from '../ProblemStatement';
import { TestCase } from '../modal/testcase';
import { Label } from '../ui/label';

export default function EditProblem({ problem }: { problem: Problem }) {
  const utils = trpc.useUtils();

  const { data: toggle } = trpc.problem.gettogglehidden.useQuery(problem.id);
  console.log(toggle);

  const updateProblem = trpc.problem.update.useMutation({
    onMutate: async (data) => {
      console.log('updateProblem onMutate');
      // await utils.problem.getAll.cancel();
      // await utils.problem.getAll.refetch();
    },
  });
  const deleteProblem = trpc.problem.remove.useMutation({
    onSuccess: () => {
      utils.problem.getAll.invalidate().catch(console.error);
      // .catch(console.error);
      console.log('deleteProblem onSuccess');
    },
  });

  const togglePublish = trpc.problem.togglehidden.useMutation({
    onSuccess: async () => {
      //  await utils.problem.getAll.invalidate();
      await utils.problem.gettogglehidden.invalidate(problem.id);
      console.log('togglePublish onSuccess');
    },
  });

  const handlepublish = async () => {
    try {
      await togglePublish.mutateAsync(problem.id);
      toast.success('Problem updated successfully');
    } catch (e) {
      const error = e as Error;
      toast.error(error.message);
    }
  };

  const router = useRouter();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteProblem.mutateAsync(problem.id);

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

  const form = useForm<z.infer<typeof editProblem>>({
    resolver: zodResolver(editProblem),
    defaultValues: {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      slug: problem.slug,
      description: problem.description ?? '',
      structure: problem.structure ?? '',
    },
  });

  console.log(problem);

  const { isValid, isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof editProblem>) {
    try {
      await updateProblem.mutateAsync(values);
      toast.success('Problem updated successfully');
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
  const [structure, setStructure] = [
    form.watch('structure'),
    (desc: string) => form.setValue('structure', desc),
  ];
  return (
    <main className="">
      <div className="flex w-full">
        <div className="container">
          <div className="my-2 flex justify-between">
            <h1 className="text-2xl font-bold">Edit Problem Details</h1>
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
                  <h2 className="text-xl font-bold">Delete Problem</h2>
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
          {/* <div className="flex justify-end">
          </div> */}

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
                <div className="flex w-full gap-2">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="CM123" {...field} />
                        </FormControl>

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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Description</Label>
                  <MDEditor
                    height={400}
                    value={description}
                    preview="edit"
                    extraCommands={[]}
                    onChange={(value) => setDescription(value ?? '')}
                  />
                </div>
                {/* 
                    TODO: customize this editor to add custom toolbar
                    demo: https://codesandbox.io/embed/react-md-editor-custom-toolbars-m2n10?fontsize=14&hidenavigation=1&theme=dark
                    docs: https://www.npmjs.com/package/@uiw/react-md-editor
                 */}
                <div className="space-y-1">
                  <Label>Boiler Plate Structure</Label>
                  <MDEditor
                    height={200}
                    value={structure}
                    preview="edit"
                    extraCommands={[]}
                    onChange={(value) => setStructure(value ?? '')}
                  />
                </div>

                <div className="flex justify-end w-full">
                  <Button className="" type="submit" disabled={isSubmitting}>
                    Save
                  </Button>
                </div>
                <TestCase id={problem.id} />
              </form>
            </Form>
          </section>
        </div>
        <div className="container pb-2 pl-0">
          {' '}
          {/* max-h-[84vh] overflow-y-auto */}
          <div className="my-2">
            <h1 className="text-2xl font-bold">Problem Details Preview</h1>
          </div>
          <section className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
            <div className="prose prose-stone dark:prose-invert">
              <ProblemStatement description={`## ${title} \n` + description} />
            </div>
          </section>
          {/* <div className="prose lg:prose-xl">
            <MDEditor.Markdown source={`## ${title} \n`+description} className="!bg-transparent" style={{ whiteSpace: 'pre-wrap' }} />
          </div> */}
        </div>
      </div>
    </main>
  );
}
