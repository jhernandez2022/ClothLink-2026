import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../database/db';

export const getPrendasService = async () => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.*, c.nombre as categoria, u.nombre as donante
     FROM prendas p
     JOIN categorias c ON p.id_categoria = c.id_categoria
     JOIN usuarios u ON p.id_donante = u.id_usuario
     WHERE p.disponible = TRUE`
  );
  return rows;
};

export const createPrendaService = async (prendaData: any, id_donante: number) => {
  const { titulo, descripcion, talla, estado_prenda, cantidad, id_categoria, imagen_url } = prendaData;
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO prendas (titulo, descripcion, talla, estado_prenda, cantidad, id_donante, id_categoria, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [titulo, descripcion, talla, estado_prenda, cantidad || 1, id_donante, id_categoria, imagen_url || null]
  );
  return { id_prenda: result.insertId, ...prendaData, id_donante };
};

export class PrendaAccessError extends Error {
  constructor(public readonly code: 'ITEM_NOT_FOUND' | 'NOT_ITEM_OWNER') {
    super(code === 'ITEM_NOT_FOUND'
      ? 'La prenda no existe.'
      : 'Solo el donante que publicó esta prenda puede eliminarla.');
    this.name = 'PrendaAccessError';
  }
}

export const deletePrendaService = async (id_prenda: number, id_donante: number): Promise<void> => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id_donante FROM prendas WHERE id_prenda = ?',
    [id_prenda]
  );
  if (rows.length === 0) {
    throw new PrendaAccessError('ITEM_NOT_FOUND');
  }
  if (Number(rows[0].id_donante) !== id_donante) {
    throw new PrendaAccessError('NOT_ITEM_OWNER');
  }

  await pool.query(
    'UPDATE prendas SET disponible = FALSE WHERE id_prenda = ? AND id_donante = ?',
    [id_prenda, id_donante]
  );
};
