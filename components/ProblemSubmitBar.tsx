'use client';

import { useEffect, useState } from 'react';

import { trpc } from '@/app/_trpc/client';
import { LANGUAGE_MAPPING } from '@/common/language';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useActiveTabSubmission,
  type ActiveTabType,
} from '@/hooks/use-active-tab-submissions';
import { useCode } from '@/hooks/use-code';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useLanguage } from '@/hooks/use-language';
import { useOutputBox } from '@/hooks/use-show-compile-box';
import type { SUPPORTED_LANGS } from '@/types';
import { default as Editor } from '@monaco-editor/react';
import type {
  DefaultCode,
  Problem,
  submissions as testCasesType,
} from '@prisma/client';
import { CheckIcon, XCircle as CircleX, ClockIcon } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import {
  default as ProblemRunCode,
  RenderCompileAndRunStatus,
} from './ProblemRunCode';
import { SubmissionTable, type ISubmission } from './SubmissionTable';

enum SubmitStatus {
  SUBMIT = 'SUBMIT',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  FAILED = 'FAILED',
}

export interface IProblem extends Problem {
  defaultCode: DefaultCode[];
}

export const ProblemSubmitBar = ({
  problem,
  contestId,
}: {
  problem: IProblem;
  contestId?: string;
}) => {
  const { activeTab, setActiveTab } = useActiveTabSubmission();
  const { data: submissions } = trpc.submission.getAllByUser.useQuery(
    problem.id
  );
  console.log(submissions);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-900">
      <div className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Tabs
              defaultValue="problem"
              className="rounded-md p-1"
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as ActiveTabType)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="problem">Submit</TabsTrigger>
                <TabsTrigger value="submissions">Submissions</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className={`${activeTab === 'problem' ? '' : 'hidden'}`}>
          <SubmitProblem problem={problem} contestId={contestId} />
        </div>
        {activeTab === 'submissions' && (
          <Submissions submissions={submissions ?? []} />
        )}
      </div>
    </div>
  );
};

function Submissions({ submissions }: { submissions: ISubmission[] }) {
  return (
    <div>
      <SubmissionTable submissions={submissions ?? []} />
    </div>
  );
}
function SubmitProblem({
  problem,
  contestId,
}: {
  problem: IProblem;
  contestId?: string;
}) {
  const utils = trpc.useUtils();
  const language = useLanguage((state) => state.language);
  const setLanguage = useLanguage((state) => state.setLanguage);
  const code = useCode((state) => state.code);
  const setCode = useCode((state) => state.setCode);
  console.log(code);
  const [status, setStatus] = useState<SubmitStatus>(SubmitStatus.SUBMIT);
  const [submissionId, setSubmissionId] = useState<string>('');
  const poll = trpc.submission.poll.useQuery({
    submissionId,
    activeContestId: contestId,
  });
  const setOutputStatus = useOutputBox((state) => state.setStatus);

  const makeSubmission = trpc.submission.submit.useMutation({
    onSuccess: (data) => {
      setSubmissionId(data.id);
      setOutputStatus('SUBMISSION');
      setStatus(SubmitStatus.SUBMIT);
      setTimeout(() => {
        utils.submission.getAllByUser.invalidate(problem.id).catch((error) => {
          console.log(error);
        });
      }, 5000);
    },
  });
  const user = useCurrentUser();

  useEffect(() => {
    const timer = setTimeout(() => {
      const defaultCode: Record<string, string> = {};
      problem.defaultCode.forEach((c) => {
        const language = Object.keys(LANGUAGE_MAPPING).find(
          (language) =>
            LANGUAGE_MAPPING[language as SUPPORTED_LANGS]?.internal ===
            c.languageId
        );
        if (!language) return;
        defaultCode[language] = c.code;
      });
      console.log(code);
      console.log(defaultCode);
      if (!code) setCode(defaultCode);
    }, 2000);
    return () => clearTimeout(timer);
  }, [problem, code, setCode]);

  async function pollWithBackoff(id: string, retries: number) {
    if (retries === 0) {
      setStatus(SubmitStatus.SUBMIT);
      toast.error('Not able to get status ');
      return;
    }

    if (poll.data?.isAllAC) {
      setStatus(SubmitStatus.ACCEPTED);
      return;
    }

    if (poll.data?.isAllFinished) {
      return;
    }

    await poll.refetch().catch((error) => {
      console.log(error);
    });
    await new Promise((resolve) => setTimeout(resolve, 2.5 * 1000));
    pollWithBackoff(id, retries - 1).catch((error) => {
      console.log(error);
    });
  }

  async function submit() {
    try {
      setOutputStatus('LOADING');
      await makeSubmission.mutateAsync({
        code: code![language],
        languageId: language,
        problemId: problem.id,
        activeContestId: contestId,
      });
      pollWithBackoff(submissionId, 10).catch((e) => {
        console.log(e);
        console.error(e);
      });
    } catch (error) {
      setOutputStatus('NONE');
      const e = error as Error;
      console.log(e);
      toast.error(e.message);
      setStatus(SubmitStatus.SUBMIT);
    }
  }

  return (
    <div>
      <Label htmlFor="language">Language</Label>
      <Select
        value={language}
        defaultValue="cpp"
        onValueChange={(value) => setLanguage(value as SUPPORTED_LANGS)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(LANGUAGE_MAPPING).map((language) => (
            <SelectItem key={language} value={language}>
              {LANGUAGE_MAPPING[language as SUPPORTED_LANGS]?.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="rounded-md pt-4">
        <Editor
          height={'60vh'}
          value={code ? code[language] : ''}
          theme="vs-dark"
          onMount={() => ({})}
          options={{
            fontSize: 14,
            scrollBeyondLastLine: false,
          }}
          language={LANGUAGE_MAPPING[language]?.monaco}
          onChange={(value) => {
            console.log(value);
            setCode({ ...code, [language]: value! });
          }}
          defaultLanguage="javascript"
        />
      </div>
      <div className="flex justify-end gap-4">
        <ProblemRunCode problem={problem} />
        {/* TODO: Add reCAPTCHA verification using cloudflare */}
        {/* {process.env.NODE_ENV === "production" ?
          < Turnstile
            onSuccess={(token: string) => {
              setToken(token);
            }}
            siteKey={TURNSTILE_SITE_KEY}
          /> : null
        } */}
        <Button
          disabled={status === SubmitStatus.PENDING}
          type="submit"
          className="align-right mt-4"
          onClick={user ? submit : () => signIn()}
        >
          {user
            ? status === SubmitStatus.PENDING
              ? 'Submitting'
              : 'Submit'
            : 'Login to submit'}
        </Button>
      </div>
      <RenderCompileAndRunStatus />
      <RenderTestcaseWrapper submissionId={submissionId} />
      {/* <RenderTestcase testcases={testcases} /> */}
    </div>
  );
}

function renderResult(status: string | number | null) {
  switch (status) {
    case 'AC':
      return <CheckIcon className="h-6 w-6 text-green-500" />;
    case 'FAIL':
      return <CircleX className="h-6 w-6 text-red-500" />;
    case 'TLE':
      return <ClockIcon className="h-6 w-6 text-red-500" />;
    case 'COMPILATION_ERROR':
      return <CircleX className="h-6 w-6 text-red-500" />;
    case 'PENDING':
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    case 1:
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    case 2:
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
    case 3:
      return <CheckIcon className="h-6 w-6 text-green-500" />;
    case 4:
      return <CircleX className="h-6 w-6 text-red-500" />;
    case 5:
      return <ClockIcon className="h-6 w-6 text-red-500" />;
    case 6:
      return <CircleX className="h-6 w-6 text-red-500" />;
    case 13:
      return <div className="text-gray-500">Internal Error!</div>;
    case 14:
      return <div className="text-gray-500">Exec Format Error!</div>;
    default:
      return <ClockIcon className="h-6 w-6 text-yellow-500" />;
  }
}

function RenderTestcaseWrapper({ submissionId }: { submissionId: string }) {
  const { data: testcases, isLoading } = trpc.submission.getTestcases.useQuery(
    submissionId,
    {
      refetchInterval: 1000,
    }
  );
  const outputStatus = useOutputBox((state) => state.status);
  console.log(testcases);
  if (isLoading) return <div>Loading...</div>;
  if (outputStatus !== 'SUBMISSION' || !testcases) return null;
  return <RenderTestcase testcases={testcases ?? []} />;
}

function RenderTestcase({ testcases }: { testcases: testCasesType[] }) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {testcases.map((testcase, index) => (
        <div key={index} className="rounded-md border">
          <div className="flex justify-center px-2 pt-2">
            <div className="">Test #{index + 1}</div>
          </div>
          <div className="flex justify-center p-2">
            {renderResult(testcase.status_id)}
          </div>
        </div>
      ))}
    </div>
  );
}
