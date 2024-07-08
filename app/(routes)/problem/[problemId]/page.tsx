import { ProblemStatement } from '@/components/ProblemStatement';
import { ProblemSubmitBar } from '@/components/ProblemSubmitBar';
import { getProblem } from '@/lib/problem';

export default async function ProblemPage({
  params: { problemId },
}: {
  params: {
    problemId: string;
  };
}) {
  const problem = await getProblem(problemId);

  if (!problem) {
    return <div>Problem not found</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="grid flex-1 gap-8 py-8 md:grid-cols-2 md:gap-12 md:py-12">
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
          <div className="prose prose-stone dark:prose-invert">
            <ProblemStatement
              description={`## ${problem.title} \n` + problem.description ?? ''}
            />
          </div>
        </div>
        <ProblemSubmitBar problem={problem} />
      </main>
    </div>
  );
}
export const dynamic = 'force-dynamic';
