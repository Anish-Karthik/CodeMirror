import { LANGUAGE_MAPPING } from '@/common/language';
import type { IProblemEvaluation } from '@/lib/code-evaluation/index';
import type { SUPPORTED_LANGS } from '@/types';
import type { submissions } from '@prisma/client';
import axios from 'axios';

const JUDGE0_URI = process.env.JUDGE0_URI ?? 'https://judge0-ce.p.rapidapi.com';

export async function submitToJudge0({
  fullBoilerplateCode,
  languageId,
  inputs,
  outputs,
  URI = JUDGE0_URI,
}: ISubmitToJudge0) {
  try {
    console.log(fullBoilerplateCode);
    console.log(inputs);
    console.log(outputs);
    console.log(languageId);
    const response: {
      data: { token: string }[];
    } = await axios.post(
      `${URI}/submissions/batch?base64_encoded=false`,
      {
        submissions: inputs.map((input, index) => ({
          language_id: LANGUAGE_MAPPING[languageId].judge0,
          source_code: fullBoilerplateCode.replace(
            '##INPUT_FILE_INDEX##',
            index.toString()
          ),
          stdin: inputs[index],
          expected_output: outputs[index],
        })),
      },
      {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY ?? '',
        },
      }
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    console.log(error);
    throw new Error('Error submitting to Judge0');
  }
}

export async function submitToJudge0Wrapper({
  URI,
  problem,
  languageId,
}: ISubmitToJudge0Wrapper) {
  return submitToJudge0({
    fullBoilerplateCode: problem.fullBoilerplateCode,
    languageId,
    inputs: problem.inputs,
    outputs: problem.outputs,
    URI: URI ?? JUDGE0_URI,
  });
}

export const addUserCodeToBoilerplate = (
  fullBoilerplateCode: string,
  userCode: string
) => {
  return fullBoilerplateCode.replace('##USER_CODE_HERE##', userCode);
};

export const fetchSubmissions = async (tokens: (string | null)[]) => {
  try {
    const FIELDS =
      'source_code,language_id,stdin,expected_output,stdout,status_id,created_at,finished_at,time,memory,stderr,token,number_of_runs,cpu_time_limit,cpu_extra_time,wall_time_limit,memory_limit,stack_limit,max_processes_and_or_threads,enable_per_process_and_thread_time_limit,enable_per_process_and_thread_memory_limit,max_file_size,compile_output,exit_code,exit_signal,message,wall_time,compiler_options,command_line_arguments,redirect_stderr_to_stdout,callback_url,additional_files,enable_network&tokens=bccfb692-4ce7-4b1d-bf37-399d840921ad';
    const response: { data: { submissions: submissions[] } } = await axios.get(
      `${JUDGE0_URI}/submissions/batch?base64_encoded=false&fields=${FIELDS}&tokens=${tokens?.join(',')}`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY ?? '',
        },
      }
    );
    return response.data.submissions;
  } catch (error) {
    console.error(error);
    console.log(error);
    throw new Error('Error fetching submissions');
  }
};

export interface ISubmitToJudge0Base {
  URI?: string;
  languageId: SUPPORTED_LANGS;
}

export interface ISubmitToJudge0 extends ISubmitToJudge0Base {
  fullBoilerplateCode: string;
  inputs: string[];
  outputs: string[];
}

export interface ISubmitToJudge0Wrapper extends ISubmitToJudge0Base {
  problem: IProblemEvaluation;
}
