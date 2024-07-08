import { default as fs } from 'fs';

export const readLocalFile = (path: string) => {
  return fs.readFileSync(path, 'utf8');
};
