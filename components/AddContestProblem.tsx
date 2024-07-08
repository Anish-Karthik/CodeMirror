'use client';

import React from 'react';

import { trpc } from '@/app/_trpc/client';
import { default as toast } from 'react-hot-toast';
import { FaTrash } from 'react-icons/fa';
import { default as Select } from 'react-select';
import { default as makeAnimated } from 'react-select/animated';
import { Button } from './ui/button';

export default function AddContestProblem({
  contestId,
}: {
  contestId: string;
}) {
  const utils = trpc.useUtils();
  const [selectedProblems, setSelectedProblems] = React.useState<
    { value: string; label: string; difficulty: string }[]
  >([]);
  const [displayedProblems, setDisplayedProblems] = React.useState<
    { value: string; label: string; difficulty: string }[]
  >([]);
  const [clicked, setClicked] = React.useState(false);

  const animatedComponents = makeAnimated();
  const { data } = trpc.problem.getAll.useQuery() ?? { data: [] };
  const addProblems = trpc.contest.addProblems.useMutation({
    onSuccess: async () => {
      toast.success('Problems added successfully');
      console.log('dhanush');
      await utils.contest.getContestProblems.invalidate(contestId);
    },
  });
  const removeProblems = trpc.contest.removeProblem.useMutation({
    onSuccess: async () => {
      toast.success('Problems removed successfully');
      await utils.contest.getContestProblems.invalidate(contestId);
    },
  });
  const { data: contestProblems } =
    trpc.contest.getContestProblems.useQuery(contestId);
  console.log(contestProblems);

  const handleAddProblems = async () => {
    setDisplayedProblems(selectedProblems);
    await addProblems.mutateAsync({
      contestId: contestId,
      problemIds: selectedProblems.map((problem) => problem.value),
    });
    setClicked(true);
  };

  const handleRemoveProblem = async (problemId: string) => {
    await removeProblems.mutateAsync({
      contestId: contestId,
      problemId: problemId,
    });
  };

  const contestProblemsSet = new Set(
    contestProblems?.map(({ problem }) => problem.id)
  );
  const availableProblems = data
    ?.filter((problem) => !contestProblemsSet.has(problem.id))
    .map((problem) => ({
      value: problem.id,
      label: problem.title,
      difficulty: problem.difficulty,
    }));

  return (
    <div className="p-4">
      <div className="mb-4 flex">
        <div className="flex-grow text-black">
          <Select
            closeMenuOnSelect={true}
            components={animatedComponents}
            options={availableProblems ?? []}
            isMulti
            onChange={(selectedOptions) =>
              setSelectedProblems(
                selectedOptions as {
                  value: string;
                  label: string;
                  difficulty: string;
                }[]
              )
            }
          />
        </div>
        <Button
          className="ml-4 cursor-pointer"
          variant="outline"
          elementType="div"
          onClick={handleAddProblems}
        >
          Add Problems
        </Button>
      </div>
      {
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {contestProblems?.map(({ problem }) => (
            <div
              key={problem.id}
              className="bg-hsl(220.91deg 39.29% 10.98%) relative min-w-[200px] max-w-[400px] flex-1 rounded-lg border p-4 text-white shadow-md"
            >
              <h3 className="text-lg font-semibold text-white">
                {problem.title}
              </h3>
              <p className="text-gray-300">{problem.difficulty}</p>
              <button
                onClick={() => handleRemoveProblem(problem.id)}
                className="absolute right-2 top-2 text-gray-300 hover:text-red-500"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
