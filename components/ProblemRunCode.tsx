import { trpc } from '@/app/_trpc/client';
import { useCode } from '@/hooks/use-code';
import { useLanguage } from '@/hooks/use-language';
import { useOutputBox } from '@/hooks/use-show-compile-box';
import { useTokens } from '@/hooks/use-tokens';
import { cn } from '@/lib/utils';
import { type Problem } from '@prisma/client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getColor, getIcon, mapJudge0Status } from './SubmissionTable';
import { Button } from './ui/button';

export type TestResultType = {
  testCaseNo: number;
  compilerMessage: string;
  input: string;
  output: string;
  expectedOutput: string;
};
const ProblemRunCode = ({ problem }: { problem: Problem }) => {
  const code = useCode((state) => state.code);
  const language = useLanguage((state) => state.language);
  const setOutputWindow = useOutputBox((state) => state.setStatus);
  const { tokens, setTokens } = useTokens();
  const runCodeHook = trpc.runCode.submit.useMutation({
    onSuccess: (data) => {
      console.log(data);
      setOutputWindow('COMPILE');
      setTokens(data);
    },
  });
  const poll = trpc.runCode.poll.useQuery(tokens);

  async function pollWithBackoff(retries: number) {
    if (retries === 0) {
      toast.error('Not able to get status ');
      return;
    }

    if (poll.data?.allFinished) {
      return;
    }

    await poll.refetch().catch((error) => {
      console.log(error);
    });
    await new Promise((resolve) => setTimeout(resolve, 2.5 * 1000));
    pollWithBackoff(retries - 1).catch((error) => {
      console.log(error);
    });
  }
  async function runCode() {
    try {
      setOutputWindow('LOADING');
      if (!code) {
        throw new Error('Code is empty');
      }
      if (!language) {
        throw new Error('Language is empty');
      }
      await runCodeHook.mutateAsync({
        code: code[language],
        languageId: language,
        problemId: problem.id,
      });
      pollWithBackoff(10).catch((e) => {
        console.log(e);
        console.error(e);
      });
    } catch (error) {
      setOutputWindow('NONE');
      const e = error as Error;
      console.log(e);
      toast.error(e.message);
    }
  }

  return (
    <div className="flex">
      <Button
        type="submit"
        className="align-right mt-4 bg-white"
        onClick={runCode}
        disabled={runCodeHook.isPending}
      >
        Run Code
      </Button>
    </div>
  );
};

export default ProblemRunCode;

export function RenderCompileAndRunStatus() {
  const [testResult, setTestResult] = useState<TestResultType | null>(null);
  const tokens = useTokens((state) => state.tokens);
  const poll = trpc.runCode.poll.useQuery(tokens);
  const { status: outputStatus, setStatus: setOutputStatus } = useOutputBox(
    (state) => state
  );
  console.log(poll);

  useEffect(() => {
    if (poll.data && poll.data?.testcaseResults.length !== 0) {
      const testcaseResults = poll.data.testcaseResults;
      setTestResult({
        testCaseNo: 1,
        compilerMessage: mapJudge0Status(testcaseResults[0].status_id),
        expectedOutput: testcaseResults[0].expected_output!,
        input: testcaseResults[0].stdin!,
        output: testcaseResults[0].stdout!,
      });
    }
  }, [poll.data]);
  if (outputStatus === 'LOADING' || poll.isLoading)
    return <div>Loading...</div>;
  if (outputStatus !== 'COMPILE' || !poll.data) return null;

  return (
    <div className="mt-4 h-[450px] w-[100%] overflow-hidden border border-gray-300 bg-white text-black shadow-inherit">
      <div className="flex h-full overflow-y-auto">
        <div
          className={cn(
            'flex flex-col p-3',
            testResult ? 'w-[40%]' : 'w-[100%]'
          )}
        >
          {poll.data?.testcaseResults.map((testcaseResult, ind) => {
            return (
              <>
                <div
                  onClick={() => {
                    setTestResult({
                      testCaseNo: ind + 1,
                      compilerMessage: mapJudge0Status(
                        testcaseResult.status_id
                      ),
                      expectedOutput: testcaseResult.expected_output!,
                      input: testcaseResult.stdin!,
                      output: testcaseResult.stdout!,
                    });
                  }}
                  className={cn(
                    'cursor-pointer px-5 py-6 font-sans text-[15px] text-xl shadow-md flex gap-1 items-center',
                    getColor(mapJudge0Status(testcaseResult.status_id))
                  )}
                >
                  <div className="">
                    {getIcon(mapJudge0Status(testcaseResult.status_id))}
                  </div>
                  {/* {testcaseResult.output != testcaseResult.expectedOutput && '❌ '}{' '}
                      {testcaseResult.output == testcaseResult.expectedOutput && '✅ '} */}
                  <p className="!text-base">Sample TestCase {ind + 1}</p>
                </div>
              </>
            );
          })}
        </div>
        {testResult && (
          <div className="flex w-[60%] flex-col gap-3 p-3">
            {testResult.testCaseNo != -1 && (
              <>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted">Compiler Message</div>
                  <div
                    className={cn(
                      'shadow-m bg-[#f3f7f7] p-3',
                      getColor(testResult.compilerMessage)
                    )}
                  >
                    {testResult.compilerMessage}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted">Input (stdin)</div>
                  <div className="rounded-sm bg-[#f3f7f7] p-3">
                    {testResult.input}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted">Your Output (stdout)</div>
                  <div className="rounded-sm bg-[#f3f7f7] p-3">
                    {testResult.output}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted">Expected Output</div>
                  <div className="rounded-sm bg-[#f3f7f7] p-3">
                    {testResult.expectedOutput}
                  </div>
                </div>
              </>
            )}
            <Button
              type="submit"
              className="align-right mt-4"
              onClick={() => {
                setOutputStatus('NONE');
              }}
            >
              Close Results
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
