import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { useState } from 'react';

import { LANGUAGE_ID_MAPPING, LANGUAGE_MAPPING } from '@/common/language';
import { useActiveTabSubmission } from '@/hooks/use-active-tab-submissions';
import { useCode } from '@/hooks/use-code';
import { Editor } from '@monaco-editor/react';
import type { Submission, submissions } from '@prisma/client';
import {
  Check,
  CheckIcon,
  XCircle as CircleX,
  ClockIcon,
  Copy,
} from 'lucide-react';
import { Button } from './ui/button';

export interface ISubmission extends Submission {
  testcases: submissions[];
}

// [ { "id": 1, "description": "In Queue" }, { "id": 2, "description": "Processing" }, { "id": 3, "description": "Accepted" }, { "id": 4, "description": "Wrong Answer" }, { "id": 5, "description": "Time Limit Exceeded" }, { "id": 6, "description": "Compilation Error" }, { "id": 7, "description": "Runtime Error (SIGSEGV)" }, { "id": 8, "description": "Runtime Error (SIGXFSZ)" }, { "id": 9, "description": "Runtime Error (SIGFPE)" }, { "id": 10, "description": "Runtime Error (SIGABRT)" }, { "id": 11, "description": "Runtime Error (NZEC)" }, { "id": 12, "description": "Runtime Error (Other)" }, { "id": 13, "description": "Internal Error" }, { "id": 14, "description": "Exec Format Error" } ]

export function mapJudge0Status(status: number | null) {
  switch (status) {
    case 1:
      return 'PENDING';
    case 2:
      return 'PENDING';
    case 3:
      return 'AC';
    case 4:
      return 'FAIL';
    case 5:
      return 'TLE';
    case 6:
      return 'COMPILATION_ERROR';
    case 11:
      return 'RUNTIME_ERROR (NZEC)';
    case 12:
      return 'RUNTIME_ERROR (OTHER)';
    case 13:
      return 'Internal Error';
    case 14:
      return 'Exec Format Error';
    default:
      return 'Runtime Error';
  }
}

// Color mapping
export function getColor(status: string) {
  switch (status) {
    case 'AC':
      return 'text-green-500';
    case 'FAIL':
      return 'text-red-500';
    case 'TLE':
      return 'text-red-500';
    case 'COMPILATION_ERROR':
      return 'text-red-500';
    case 'PENDING':
      return 'text-yellow-500';
    case 'REJECTED':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}

// Icon mapping
export function getIcon(status: string) {
  switch (status) {
    case 'AC':
      return <CheckIcon className="h-4 w-4" />;
    case 'FAIL':
      return <CircleX className="h-4 w-4" />;
    case 'REJECTED':
      return <CircleX className="h-4 w-4" />;
    case 'TLE':
      return <ClockIcon className="h-4 w-4" />;
    case 'COMPILATION_ERROR':
      return <CircleX className="h-4 w-4" />;
    case 'PENDING':
      return <ClockIcon className="h-4 w-4" />;
    default:
      return <ClockIcon className="h-4 w-4" />;
  }
}
export function SubmissionTable({
  submissions,
}: {
  submissions: ISubmission[];
}) {
  const setLanguageCode = useCode((state) => state.setLanguageCode);
  const setActiveTab = useActiveTabSubmission((state) => state.setActiveTab);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<{
    id: string;
    code: string;
    testcases: submissions[];
  }>({
    id: '',
    code: '',
    testcases: [],
  });
  const handleOpen = (submission: ISubmission) => {
    setSelectedSubmission(submission);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };
  const [copied, setCopied] = useState(false);
  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(selectedSubmission.code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const handleMoveToEditor = () => {
    if (selectedSubmission.testcases.length === 0) {
      return;
    }
    // Implement the logic to move to an editor view or open an editor component
    // Example: Redirect to an editor route or render an editor component
    setLanguageCode(
      LANGUAGE_ID_MAPPING[selectedSubmission.testcases[0].language_id!],
      selectedSubmission.code
    );
    setActiveTab('problem');
    console.log('Move to Editor clicked');
  };

  const getTestCaseStatus = (testcase: submissions) => {
    // switch (testcase.status_id) {
    //   case "passed":
    //     return <span className="text-green-500">Passed</span>;
    //   case "failed":
    //     return <span className="text-red-500">Failed</span>;
    //   default:
    //     return <span className="text-gray-500">Not Run</span>;
    // }
  };

  return (
    <div className="overflow-x-auto">
      {!isOpen ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time Submitted</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  {format(
                    new Date(submission.createdAt),
                    'yyyy-MM-dd HH:mm:ss'
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getIcon(submission.status)}
                    <button className="underline text-blue-500">
                      <span className={`ml-2 ${getColor(submission.status)}`}>
                        {submission.status}
                      </span>
                    </button>
                  </div>
                </TableCell>
                <TableCell>
                  {Math.max(
                    ...submission.testcases.map((testcase) =>
                      Number(testcase.time ?? 0)
                    )
                  )}
                </TableCell>
                <TableCell>
                  {Math.max(
                    ...submission.testcases.map((testcase) =>
                      Number(testcase.memory ?? 0)
                    )
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="link" onClick={() => handleOpen(submission)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Submission Detail</h1>
            <Button onClick={handleClose}>Close</Button>
          </div>

          <hr className="my-4" />
          <h2 className="text-xl font-semibold mb-2">Submission Code</h2>

          <pre className="rounded-md relative">
            <div className="flex justify-end gap-1 absolute z-30 right-0">
              <Button variant={'ghost'} size="icon" onClick={handleCopyCode}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant={'ghost'} onClick={handleMoveToEditor}>
                Move to Editor
              </Button>
            </div>
            <Editor
              height={'40vh'}
              value={selectedSubmission.code}
              language={
                LANGUAGE_MAPPING[
                  LANGUAGE_ID_MAPPING[
                    selectedSubmission.testcases[0].language_id!
                  ]
                ]?.monaco
              }
              theme="vs-dark"
              onMount={() => ({})}
              options={{
                fontSize: 14,
                scrollBeyondLastLine: false,
                readOnly: true,
              }}
            />
          </pre>
          <h2 className="text-xl font-semibold mb-2">Test Case Results</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test Case</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedSubmission.testcases.map((testcase, index) => (
                <TableRow key={index}>
                  <TableCell>{`Test Case ${index + 1}`}</TableCell>
                  <TableCell>{}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
