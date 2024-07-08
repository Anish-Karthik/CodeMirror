import { api } from '@/app/_trpc/serverClient';
import { EditContest } from '@/components/form/EditContest';

const page = async ({
  params: { contestId },
}: {
  params: {
    contestId: string;
  };
}) => {
  const contest = await api.contest.get(contestId);
  if (!contest) {
    return <div>Contest not found</div>;
  }
  return <EditContest contest={contest} />;
};

export default page;
