"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarEstadoSolicitudService = exports.getSolicitudesRecibidasService = exports.getMisSolicitudesService = exports.createSolicitudService = exports.SolicitudValidationError = void 0;
const db_1 = require("../database/db");
class SolicitudValidationError extends Error {
    code;
    constructor(code) {
        const messages = {
            ITEM_NOT_FOUND: 'La prenda solicitada no existe o ya no está disponible.',
            OWN_ITEM: 'No puedes solicitar tu propia prenda.',
            REQUEST_NOT_FOUND: 'La solicitud no existe.',
            NOT_REQUEST_OWNER: 'No tienes permiso para actualizar esta solicitud.'
        };
        super(messages[code]);
        this.code = code;
        this.name = 'SolicitudValidationError';
    }
}
exports.SolicitudValidationError = SolicitudValidationError;
const createSolicitudService = async (id_prenda, id_organizacion, mensaje) => {
    const [items] = await db_1.pool.query('SELECT id_donante FROM prendas WHERE id_prenda = ? AND disponible = TRUE', [id_prenda]);
    const prenda = items[0];
    if (!prenda) {
        throw new SolicitudValidationError('ITEM_NOT_FOUND');
    }
    if (Number(prenda.id_donante) === id_organizacion) {
        throw new SolicitudValidationError('OWN_ITEM');
    }
    const [result] = await db_1.pool.query(`INSERT INTO solicitudes (id_prenda, id_organizacion, mensaje, estado)
     VALUES (?, ?, ?, 'PENDIENTE')`, [id_prenda, id_organizacion, mensaje || 'Interesado en la prenda']);
    return { id_solicitud: result.insertId, id_prenda, id_organizacion, mensaje, estado: 'PENDIENTE' };
};
exports.createSolicitudService = createSolicitudService;
const getMisSolicitudesService = async (id_organizacion) => {
    const [rows] = await db_1.pool.query(`SELECT s.id_solicitud, s.id_prenda, s.id_organizacion, s.mensaje,
            s.fecha_solicitud, s.id_solicitud AS id, s.fecha_solicitud AS fecha,
            CASE s.estado
              WHEN 'APROBADO' THEN 'ACEPTADA'
              WHEN 'RECHAZADO' THEN 'RECHAZADA'
              ELSE s.estado
            END AS estado,
            p.titulo as prenda_titulo, p.talla, p.imagen_url, u.nombre as donante_nombre
     FROM solicitudes s
     JOIN prendas p ON s.id_prenda = p.id_prenda
     JOIN usuarios u ON p.id_donante = u.id_usuario
     WHERE s.id_organizacion = ?
     ORDER BY s.id_solicitud DESC`, [id_organizacion]);
    return rows;
};
exports.getMisSolicitudesService = getMisSolicitudesService;
const getSolicitudesRecibidasService = async (id_donante) => {
    const [rows] = await db_1.pool.query(`SELECT s.id_solicitud, s.id_prenda, s.id_organizacion, s.mensaje,
            s.fecha_solicitud, s.id_solicitud AS id, s.fecha_solicitud AS fecha,
            CASE s.estado
              WHEN 'APROBADO' THEN 'ACEPTADA'
              WHEN 'RECHAZADO' THEN 'RECHAZADA'
              ELSE s.estado
            END AS estado,
            p.titulo as prenda_titulo, p.titulo as nombre, p.imagen_url, p.talla,
            u.nombre as solicitante_nombre, u.nombre as organizacion,
            u.email as solicitante_email, u.email as correo
     FROM solicitudes s
     JOIN prendas p ON s.id_prenda = p.id_prenda
     JOIN usuarios u ON s.id_organizacion = u.id_usuario
     WHERE p.id_donante = ?
     ORDER BY s.id_solicitud DESC`, [id_donante]);
    return rows;
};
exports.getSolicitudesRecibidasService = getSolicitudesRecibidasService;
const cambiarEstadoSolicitudService = async (id_solicitud, id_donante, estado) => {
    const estadoDb = estado === 'ACEPTADA' ? 'APROBADO' : 'RECHAZADO';
    const [result] = await db_1.pool.query(`UPDATE solicitudes s
     JOIN prendas p ON s.id_prenda = p.id_prenda
     SET s.estado = ?
     WHERE s.id_solicitud = ? AND p.id_donante = ?`, [estadoDb, id_solicitud, id_donante]);
    if (result.affectedRows === 0) {
        const [rows] = await db_1.pool.query(`SELECT s.id_solicitud
       FROM solicitudes s
       JOIN prendas p ON s.id_prenda = p.id_prenda
       WHERE s.id_solicitud = ? AND p.id_donante = ?`, [id_solicitud, id_donante]);
        if (rows.length > 0) {
            return { id_solicitud, estado };
        }
        const [requests] = await db_1.pool.query('SELECT id_solicitud FROM solicitudes WHERE id_solicitud = ?', [id_solicitud]);
        if (requests.length === 0) {
            throw new SolicitudValidationError('REQUEST_NOT_FOUND');
        }
        throw new SolicitudValidationError('NOT_REQUEST_OWNER');
    }
    return { id_solicitud, estado };
};
exports.cambiarEstadoSolicitudService = cambiarEstadoSolicitudService;
