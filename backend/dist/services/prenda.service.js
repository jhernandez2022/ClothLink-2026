"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePrendaService = exports.PrendaAccessError = exports.createPrendaService = exports.getPrendasService = void 0;
const db_1 = require("../database/db");
const getPrendasService = async () => {
    const [rows] = await db_1.pool.query(`SELECT p.*, c.nombre as categoria, u.nombre as donante
     FROM prendas p
     JOIN categorias c ON p.id_categoria = c.id_categoria
     JOIN usuarios u ON p.id_donante = u.id_usuario
     WHERE p.disponible = TRUE`);
    return rows;
};
exports.getPrendasService = getPrendasService;
const createPrendaService = async (prendaData, id_donante) => {
    const { titulo, descripcion, talla, estado_prenda, cantidad, id_categoria, imagen_url } = prendaData;
    const [result] = await db_1.pool.query(`INSERT INTO prendas (titulo, descripcion, talla, estado_prenda, cantidad, id_donante, id_categoria, imagen_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [titulo, descripcion, talla, estado_prenda, cantidad || 1, id_donante, id_categoria, imagen_url || null]);
    return { id_prenda: result.insertId, ...prendaData, id_donante };
};
exports.createPrendaService = createPrendaService;
class PrendaAccessError extends Error {
    code;
    constructor(code) {
        super(code === 'ITEM_NOT_FOUND'
            ? 'La prenda no existe.'
            : 'Solo el donante que publicó esta prenda puede eliminarla.');
        this.code = code;
        this.name = 'PrendaAccessError';
    }
}
exports.PrendaAccessError = PrendaAccessError;
const deletePrendaService = async (id_prenda, id_donante) => {
    const [rows] = await db_1.pool.query('SELECT id_donante FROM prendas WHERE id_prenda = ?', [id_prenda]);
    if (rows.length === 0) {
        throw new PrendaAccessError('ITEM_NOT_FOUND');
    }
    if (Number(rows[0].id_donante) !== id_donante) {
        throw new PrendaAccessError('NOT_ITEM_OWNER');
    }
    await db_1.pool.query('UPDATE prendas SET disponible = FALSE WHERE id_prenda = ? AND id_donante = ?', [id_prenda, id_donante]);
};
exports.deletePrendaService = deletePrendaService;
