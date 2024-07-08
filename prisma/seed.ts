import { LANGUAGE_MAPPING } from '@/common/language';
import { SUPPORTED_LANGS } from '@/types';
import { default as prismaClient } from '../language';
import { default as languages } from '../language/languages';

export const addLanguages = async () => {
  try {
    await prismaClient.language.createMany({
      data: Object.keys(LANGUAGE_MAPPING).map((language) => ({
        id: LANGUAGE_MAPPING[language as SUPPORTED_LANGS].internal,
        name: language,
        judge0Id: LANGUAGE_MAPPING[language as SUPPORTED_LANGS].judge0,
      })),
    });
  } catch (e) {
    console.log('Languages already persist in the DB!');
  }
};
export const addLanguages2 = async () => {
  try {
    await prismaClient.languages.createMany({ data: languages });
  } catch (e) {
    console.log('Languages2 already persist in the DB!');
  }
};

addLanguages().catch((e) => console.log(e));
addLanguages2().catch((e) => console.log(e));
// try {
//   addProblemsInDB();
// }
// catch (e) {
//   console.log("Data already persist in the DB!")
// }
