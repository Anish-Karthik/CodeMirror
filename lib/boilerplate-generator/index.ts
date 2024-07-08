import { SUPPORTED_LANGS } from '@/types';
import { db } from '../db';
import { mapLanguageToJudge0Id } from '../judge0.utils';
import { FullProblemDefinitionParser } from './FullProblemDefinitionGenerator';
import { ProblemDefinitionParser } from './ProblemDefinitionGenerator';

export const generateDefaultCodes = async ({
  structure,
  problemId,
}: {
  structure: string;
  problemId: string;
}) => {
  const parser = new ProblemDefinitionParser();
  parser.parse(structure);
  const defaultCodesString = [
    {
      language: 'cpp',
      code: parser.generateCpp(),
    },
    {
      language: 'js',
      code: parser.generateJs(),
    },
    {
      language: 'rust',
      code: parser.generateRust(),
    },
  ];

  await Promise.all(
    defaultCodesString.map(async ({ language, code }) => {
      const languageJudge0 = await db.language.findUnique({
        where: {
          judge0Id: mapLanguageToJudge0Id(language),
        },
      });
      console.log(language, code, languageJudge0);
      if (!languageJudge0) throw new Error('Invalid language');
      const defaultCode = await db.defaultCode.upsert({
        create: {
          problemId,
          code,
          languageId: languageJudge0.id,
        },
        update: {
          code,
        },
        where: {
          problemId_languageId: {
            problemId,
            languageId: languageJudge0.id,
          },
        },
      });
      return defaultCode;
    })
  );
};

export const getProblemFullBoilerplateCode = async ({
  structure,
  languageId,
}: {
  structure: string;
  languageId: SUPPORTED_LANGS;
}) => {
  const parser = new FullProblemDefinitionParser();
  parser.parse(structure);
  switch (languageId) {
    case SUPPORTED_LANGS.cpp:
      return parser.generateCpp();
    case SUPPORTED_LANGS.js:
      return parser.generateJs();
    case SUPPORTED_LANGS.rs:
      return parser.generateRust();
    default:
      throw new Error('Invalid language');
  }
};
