import { Response } from 'express';
import { CustomRequest } from '../middlewares/auth.middleware';
import {
  cambiarEstadoSolicitudService,
  createSolicitudService,
  getMisSolicitudesService,
  getSolicitudesRecibidasService,
  SolicitudValidationError
} from '../services/solicitud.service';

const parsePositiveInteger = (value: unknown): number | null => {
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

const getAuthenticatedUserId = (req: CustomRequest): number | null =>
  parsePositiveInteger(req.user?.id_usuario ?? req.user?.id);

// Crear solicitud de donación
export const crearSolicitud = async (req: CustomRequest, res: Response) => {
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

    const nuevaSolicitud = await createSolicitudService(
      id_prenda,
      id_organizacion,
      typeof mensaje === 'string' ? mensaje : ''
    );

    return res.status(201).json({ message: 'Solicitud creada con éxito', data: nuevaSolicitud });
  } catch (error: unknown) {
    console.error('Error al crear solicitud:', error);
    if (error instanceof SolicitudValidationError) {
      const status = error.code === 'OWN_ITEM' ? 403 : 404;
      return res.status(status).json({ error: error.code, message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido al procesar la solicitud.';
    return res.status(500).json({ error: 'SERVER_ERROR', message });
  }
};

// Obtener las solicitudes realizadas por la organización autenticada
export const obtenerMisSolicitudes = async (req: CustomRequest, res: Response) => {
  try {
    const id_organizacion = getAuthenticatedUserId(req);
    if (!id_organizacion) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
    }

    const solicitudes = await getMisSolicitudesService(id_organizacion);
    return res.json(solicitudes);
  } catch (error: unknown) {
    console.error('Error al obtener mis solicitudes:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido al consultar mis solicitudes.';
    return res.status(500).json({ error: 'SERVER_ERROR', message });
  }
};

// Obtener las solicitudes recibidas para las prendas que ha publicado el usuario
export const obtenerSolicitudesRecibidas = async (req: CustomRequest, res: Response) => {
  try {
    const id_donante = getAuthenticatedUserId(req);
    if (!id_donante) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
    }

    const solicitudes = await getSolicitudesRecibidasService(id_donante);
    return res.json(solicitudes);
  } catch (error: unknown) {
    console.error('Error al obtener solicitudes recibidas:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido al consultar las solicitudes recibidas.';
    return res.status(500).json({ error: 'SERVER_ERROR', message });
  }
};

// Cambiar estado de una solicitud (ACEPTADA o RECHAZADA)
export const cambiarEstadoSolicitud = async (req: CustomRequest, res: Response) => {
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

    const resultado = await cambiarEstadoSolicitudService(id_solicitud, id_donante, estado);
    return res.json({ message: 'Estado actualizado correctamente', data: resultado });
  } catch (error: unknown) {
    console.error('Error al cambiar el estado de la solicitud:', error);
    if (error instanceof SolicitudValidationError) {
      const status = error.code === 'REQUEST_NOT_FOUND' ? 404 : 403;
      return res.status(status).json({ error: error.code, message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido al actualizar la solicitud.';
    return res.status(500).json({ error: 'SERVER_ERROR', message });
  }
};
