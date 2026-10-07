"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarEstadoSolicitud = exports.obtenerSolicitudesRecibidas = exports.obtenerMisSolicitudes = exports.crearSolicitud = void 0;
const solicitud_service_1 = require("../services/solicitud.service");
const parsePositiveInteger = (value) => {
    if (typeof value !== 'string' && typeof value !== 'number') {
        return null;
    }
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) {
        return null;
    }
    const parsed = Number.parseInt(text, 10);
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};
const getAuthenticatedUserId = (req) => parsePositiveInteger(req.user?.id_usuario ?? req.user?.id);
// Crear solicitud de donación
const crearSolicitud = async (req, res) => {
    try {
        const id_organizacion = getAuthenticatedUserId(req);
        const id_prenda = parsePositiveInteger(req.body.id_prenda);
        const mensaje = req.body.mensaje ?? req.body.motivo;
        if (!id_organizacion) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
        }
        if (!id_prenda) {
            return res.status(400).json({ error: 'INVALID_ITEM', message: 'El id_prenda debe ser un entero mayor que cero.' });
        }
        const nuevaSolicitud = await (0, solicitud_service_1.createSolicitudService)(id_prenda, id_organizacion, typeof mensaje === 'string' ? mensaje : '');
        return res.status(201).json({ message: 'Solicitud creada con éxito', data: nuevaSolicitud });
    }
    catch (error) {
        console.error('Error al crear solicitud:', error);
        if (error instanceof solicitud_service_1.SolicitudValidationError) {
            const status = error.code === 'OWN_ITEM' ? 403 : 404;
            return res.status(status).json({ error: error.code, message: error.message });
        }
        const message = error instanceof Error ? error.message : 'Error desconocido al procesar la solicitud.';
        return res.status(500).json({ error: 'SERVER_ERROR', message });
    }
};
exports.crearSolicitud = crearSolicitud;
// Obtener las solicitudes realizadas por la organización autenticada
const obtenerMisSolicitudes = async (req, res) => {
    try {
        const id_organizacion = getAuthenticatedUserId(req);
        if (!id_organizacion) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
        }
        const solicitudes = await (0, solicitud_service_1.getMisSolicitudesService)(id_organizacion);
        return res.json(solicitudes);
    }
    catch (error) {
        console.error('Error al obtener mis solicitudes:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido al consultar mis solicitudes.';
        return res.status(500).json({ error: 'SERVER_ERROR', message });
    }
};
exports.obtenerMisSolicitudes = obtenerMisSolicitudes;
// Obtener las solicitudes recibidas para las prendas que ha publicado el usuario
const obtenerSolicitudesRecibidas = async (req, res) => {
    try {
        const id_donante = getAuthenticatedUserId(req);
        if (!id_donante) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
        }
        const solicitudes = await (0, solicitud_service_1.getSolicitudesRecibidasService)(id_donante);
        return res.json(solicitudes);
    }
    catch (error) {
        console.error('Error al obtener solicitudes recibidas:', error);
        const message = error instanceof Error ? error.message : 'Error desconocido al consultar las solicitudes recibidas.';
        return res.status(500).json({ error: 'SERVER_ERROR', message });
    }
};
exports.obtenerSolicitudesRecibidas = obtenerSolicitudesRecibidas;
// Cambiar estado de una solicitud (ACEPTADA o RECHAZADA)
const cambiarEstadoSolicitud = async (req, res) => {
    try {
        const id_solicitud = parsePositiveInteger(req.params.id);
        const id_donante = getAuthenticatedUserId(req);
        const { estado } = req.body;
        if (!id_solicitud) {
            return res.status(400).json({ error: 'INVALID_REQUEST_ID', message: 'El ID de solicitud no es válido.' });
        }
        if (!id_donante) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
        }
        if (estado !== 'ACEPTADA' && estado !== 'RECHAZADA') {
            return res.status(400).json({ error: 'INVALID_STATUS', message: 'Estado no válido.' });
        }
        const resultado = await (0, solicitud_service_1.cambiarEstadoSolicitudService)(id_solicitud, id_donante, estado);
        return res.json({ message: 'Estado actualizado correctamente', data: resultado });
    }
    catch (error) {
        console.error('Error al cambiar el estado de la solicitud:', error);
        if (error instanceof solicitud_service_1.SolicitudValidationError) {
            const status = error.code === 'REQUEST_NOT_FOUND' ? 404 : 403;
            return res.status(status).json({ error: error.code, message: error.message });
        }
        const message = error instanceof Error ? error.message : 'Error desconocido al actualizar la solicitud.';
        return res.status(500).json({ error: 'SERVER_ERROR', message });
    }
};
exports.cambiarEstadoSolicitud = cambiarEstadoSolicitud;
