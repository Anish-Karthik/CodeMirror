import { LANGUAGE_MAPPING } from '@/common/language';
import { SUPPORTED_LANGS } from '@/types';
import { default as fs } from 'fs';
import { default as prismaClient } from '../language';

const MOUNT_PATH = process.env.MOUNT_PATH ?? '../../apps/problems';
function promisifedReadFile(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function main(problemSlug: string, problemTitle: string) {
  const problemStatement = await promisifedReadFile(
    `${MOUNT_PATH}/${problemSlug}/Problem.md`
  );

  const problem = await prismaClient.problem.upsert({
    where: {
      slug: problemSlug,
    },
    create: {
      title: problemSlug,
      slug: problemSlug,
      description: problemStatement,
      hidden: false,
    },
    update: {
      description: problemStatement,
    },
  });

  await Promise.all(
    Object.keys(LANGUAGE_MAPPING).map(async (language) => {
      const code = await promisifedReadFile(
        `${MOUNT_PATH}/${problemSlug}/boilerplate/function.${language}`
      );
      await prismaClient.defaultCode.upsert({
        where: {
          problemId_languageId: {
            problemId: problem.id,
            languageId: LANGUAGE_MAPPING[language as SUPPORTED_LANGS].internal,
          },
        },
        create: {
          problemId: problem.id,
          languageId: LANGUAGE_MAPPING[language as SUPPORTED_LANGS].internal,
          code,
        },
        update: {
          code,
        },
      });
    })
  );
}

// export function addProblemsInDB() {
//   fs.readdir(MOUNT_PATH, (err, dirs) => {
//     if (err) {
//       console.error("Error reading directory:", err);
//       return;
//     }
//     dirs.forEach(async (dir) => {
//       await main(dir, dir);
//     });
//   });
// }
