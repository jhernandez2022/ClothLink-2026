import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_clothlink_2026';

export const generateToken = (id: number, id_rol: number) => {
  const jwtToken = jwt.sign({ id, id_rol }, JWT_SECRET, {
    expiresIn: '8h'
  });
  return jwtToken;
};

export const verifyToken = (token: string) => {
  const isOk = jwt.verify(token, JWT_SECRET);
  return isOk;
};
