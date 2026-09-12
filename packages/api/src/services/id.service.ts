import crypto from 'crypto';

export type IdPrefix = 
  | 'CAND' 
  | 'RECR' 
  | 'ORGN' 
  | 'ADMN' 
  | 'ORG' 
  | 'HACK' 
  | 'PROJ' 
  | 'VER' 
  | 'AUD' 
  | 'MSG';

export function generatePublicId(prefix: IdPrefix): string {
  const year = new Date().getFullYear();
  const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${year}-${hex}`;
}
