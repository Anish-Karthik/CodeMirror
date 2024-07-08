import Link from 'next/link';

import { api } from '@/app/_trpc/serverClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { currentUser } from '@/lib/auth';
import { type Problem } from '@prisma/client';
import { Edit } from 'lucide-react';
import { PrimaryButton } from './LinkButton';
import { default as AddProblem } from './form/AddProblem';
import { default as DialogModel } from './modal';
import { Button } from './ui/button';

export async function Problems() {
  const [problems, user] = await Promise.all([
    api.problem.getAll(),
    currentUser(),
  ]);
  const isAdmin = user?.role === 'ADMIN';
  console.log(user);
  return (
    <section className="min-h-screen bg-white py-8 dark:bg-gray-900 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-6">
          <div className="flex w-full justify-between">
            <h2 className="mb-2 text-2xl font-bold">Popular Problems</h2>
            {isAdmin && (
              <DialogModel
                title="Add Problem"
                trigger={
                  <Button variant={'outline'} elementType="div">
                    Add Problem
                  </Button>
                }
              >
                <AddProblem />
              </DialogModel>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Check out the most popular programming problems on{' '}
            {process.env.NEXT_PUBLIC_APP_NAME}.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problems.map((problem) => (
            <ProblemCard problem={problem} key={problem.id} isAdmin={isAdmin} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemCard({
  problem,
  isAdmin = false,
}: {
  problem: Problem;
  isAdmin?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex w-full justify-between">
          <CardTitle>{problem.title}</CardTitle>
          {isAdmin && (
            <Link href={`/problems/${problem.id}`}>
              <Edit />
            </Link>
          )}
        </div>
        <CardDescription>Easy problem for beginners</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Difficulty</p>
            <p>{problem.difficulty}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Submissions</p>
            <p>{problem.solved}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <PrimaryButton href={`/problem/${problem.id}`}>
          View Problem
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
