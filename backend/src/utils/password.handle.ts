import bcrypt from 'bcryptjs';

export const encryptPassword = async (pass: string): Promise<string> => {
  const passwordHash = await bcrypt.hash(pass, 10);
  return passwordHash;
};

export const verifyPassword = async (pass: string, passHash: string): Promise<boolean> => {
  const isCorrect = await bcrypt.compare(pass, passHash);
  return isCorrect;
};
