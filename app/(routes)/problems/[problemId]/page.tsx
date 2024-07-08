import { api } from '@/app/_trpc/serverClient';
import { default as EditProblemPage } from '@/components/form/EditProblem';

const page = async ({
  params: { problemId },
}: {
  params: {
    problemId: string;
  };
}) => {
  const problem = await api.problem.get(problemId);
  if (!problem) {
    return <div>Problem not found</div>;
  }
  return <EditProblemPage problem={problem} />;
};

export default page;
