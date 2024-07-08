import { SUPPORTED_OBJECT_STORES, type SUPPORTED_LANGS } from '@/types';
import { type Problem } from '@prisma/client';
import { default as axios } from 'axios';
import { getProblemFullBoilerplateCode } from '../boilerplate-generator';
import { db } from '../db';
import { readLocalFile } from '../object-store/local';
import { readS3File } from '../object-store/s3';

export interface IProblemEvaluation {
  id: string;
  fullBoilerplateCode: string;
  inputs: string[];
  outputs: string[];
}

export const getProblemForEvaluation = async (
  problem: Problem,
  languageId: SUPPORTED_LANGS,
  isHiddenTestcases = true
): Promise<IProblemEvaluation> => {
  const fullBoilderPlate = await getProblemFullBoilerplateCode({
    languageId,
    structure: problem.structure!,
  });
  // const inputs = await getProblemInputs(problemId);
  // const outputs = await getProblemOutputs(problemId);
  const { inputs, outputs } = await getProblemInputsAndOutputs(
    problem.id,
    isHiddenTestcases
  );
  console.log(inputs);

  return {
    id: problem.id,
    fullBoilerplateCode: fullBoilderPlate,
    inputs: inputs,
    outputs: outputs,
  };
};

export const getProblemInputs = async (
  problemId: string,
  hiddenTestcases = true
) => {
  const inputs = await db.testcase.findMany({
    where: {
      isHidden: hiddenTestcases,
      problemId,
      input: {
        not: null,
      },
    },
    select: {
      input: true,
    },
  });
  const inputFiles = await db.testcase.findMany({
    where: {
      isHidden: hiddenTestcases,
      problemId,
      s3InputUrl: {
        not: null,
      },
    },
    select: {
      s3InputUrl: true,
    },
  });

  await Promise.all(
    inputFiles.map(async (inputFile) => {
      const input = await processFile(inputFile.s3InputUrl!);
      if (input) {
        inputs.push({ input });
      }
    })
  );
  return inputs.map((input) => input.input);
};

export const getProblemOutputs = async (
  problemId: string,
  hiddenTestcases = true
) => {
  const outputs = await db.testcase.findMany({
    where: {
      isHidden: hiddenTestcases,
      problemId,
      output: {
        not: null,
      },
    },
    select: {
      output: true,
    },
  });
  const outputFiles = await db.testcase.findMany({
    where: {
      isHidden: hiddenTestcases,
      problemId,
      s3OutputUrl: {
        not: null,
      },
    },
    select: {
      s3OutputUrl: true,
    },
  });

  await Promise.all(
    outputFiles.map(async (outputFile) => {
      const output = await processFile(outputFile.s3OutputUrl!);
      if (output) {
        outputs.push({ output });
      }
    })
  );
  return outputs.map((output) => output.output);
};

export const getProblemInputsAndOutputs = async (
  problemId: string,
  hiddenTestcases = true
) => {
  const ioDB = await db.testcase.findMany({
    where: {
      isHidden: hiddenTestcases,
      problemId,
      input: {
        not: null,
      },
      output: {
        not: null,
      },
    },
    select: {
      input: true,
      output: true,
    },
  });
  const ioFiles = await db.testcase.findMany({
    where: {
      isHidden: hiddenTestcases,
      problemId,
      s3InputUrl: {
        not: null,
      },
      s3OutputUrl: {
        not: null,
      },
    },
    select: {
      s3InputUrl: true,
      s3OutputUrl: true,
    },
  });
  const io: { input: string; output: string }[] = ioDB.map((io) => ({
    input: io.input!,
    output: io.output!,
  }));

  await Promise.all(
    ioFiles.map(async (ioFile) => {
      const [input, output] = await Promise.all([
        processFile(ioFile.s3InputUrl!),
        processFile(ioFile.s3OutputUrl!),
      ]);
      if (input && output) {
        io.push({ input, output });
      }
    })
  );
  return {
    io,
    inputs: io.map((io) => io.input),
    outputs: io.map((io) => io.output),
  };
};

export const processUrl = async (
  fileUrl: string,
  fileStorageType: SUPPORTED_OBJECT_STORES = SUPPORTED_OBJECT_STORES.uploadthing
): Promise<string> => {
  switch (fileStorageType) {
    case SUPPORTED_OBJECT_STORES.uploadthing:
      return await axios.get(fileUrl);
    case SUPPORTED_OBJECT_STORES.s3:
      return (await readS3File(fileUrl)) as unknown as string;
    case SUPPORTED_OBJECT_STORES.local:
      return readLocalFile(fileUrl);
  }
};

export const processFile = async (
  fileUrl: string,
  fileStorageType: SUPPORTED_OBJECT_STORES = SUPPORTED_OBJECT_STORES.uploadthing
) => {
  return await processUrl(fileUrl, fileStorageType);
};
