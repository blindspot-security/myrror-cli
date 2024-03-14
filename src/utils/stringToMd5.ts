import { createHash } from 'crypto';

export const stringToMd5 = (str: string): string => {
  return createHash('md5').update(str).digest('hex');
};
