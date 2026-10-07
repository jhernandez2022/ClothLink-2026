import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/db';
import { generateToken } from '../utils/jwt.handle';
import { encryptPassword, verifyPassword } from '../utils/password.handle';

export const registerUserService = async (userData: any) => {
  const { nombre, email, password, telefono, direccion, id_rol } = userData;

  // Verificar si el correo ya existe
  const [existingUser] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );

  if (existingUser.length > 0) {
    throw new Error('EMAIL_ALREADY_EXISTS');
  }

  // Encriptar contraseña
  const passwordHash = await encryptPassword(password);

  // Insertar nuevo usuario
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO usuarios (nombre, email, password, telefono, direccion, id_rol) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre, email, passwordHash, telefono || null, direccion || null, id_rol || 2]
  );

  return { id_usuario: result.insertId, nombre, email, id_rol: id_rol || 2 };
};

export const loginUserService = async ({ email, password }: any) => {
  // Buscar usuario
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE email = ? AND activo = TRUE',
    [email]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = rows[0];

  // Verificar contraseña
  const isCorrect = await verifyPassword(password, user.password);
  if (!isCorrect) {
    throw new Error('INVALID_PASSWORD');
  }

  // Generar JWT
  const token = generateToken(user.id_usuario, user.id_rol);

  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      id_rol: user.id_rol
    }
  };
};
