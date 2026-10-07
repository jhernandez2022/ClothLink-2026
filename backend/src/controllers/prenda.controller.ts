import { Response } from 'express';
import { promises as fs } from 'node:fs';
import { CustomRequest } from '../middlewares/auth.middleware';
import {
  createPrendaService,
  deletePrendaService,
  getPrendasService,
  PrendaAccessError
} from '../services/prenda.service';

export const deletePrendaCtrl = async (req: CustomRequest, res: Response) => {
  const idParam = req.params.id;
  const id_prenda = typeof idParam === 'string' ? Number.parseInt(idParam, 10) : Number.NaN;
  const id_donante = req.user?.id_usuario ?? req.user?.id;

  if (!Number.isSafeInteger(id_prenda) || id_prenda <= 0) {
    return res.status(400).json({ error: 'INVALID_ITEM_ID', message: 'El ID de la prenda no es válido.' });
  }
  if (!id_donante) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
  }

  try {
    await deletePrendaService(id_prenda, id_donante);
    return res.json({ status: 'success', message: 'La prenda se eliminó correctamente.' });
  } catch (error: unknown) {
    console.error('Error al eliminar la prenda:', error);
    if (error instanceof PrendaAccessError) {
      const status = error.code === 'ITEM_NOT_FOUND' ? 404 : 403;
      return res.status(status).json({ error: error.code, message: error.message });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido al eliminar la prenda.';
    return res.status(500).json({ error: 'SERVER_ERROR', message });
  }
};

export const getPrendasCtrl = async (_req: CustomRequest, res: Response) => {
  try {
    const prendas = await getPrendasService();
    res.json({ status: 'success', data: prendas });
  } catch (error: any) {
    console.error('Error en getPrendasCtrl:', error);
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

export const createPrendaCtrl = async (req: CustomRequest, res: Response) => {
  try {
    const id_donante = req.user?.id_usuario ?? req.user?.id;
    if (!id_donante) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'No se identificó al usuario autenticado.' });
    }

    const { titulo, descripcion, talla, estado_prenda } = req.body;
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
    const cantidad = req.body.cantidad === undefined || req.body.cantidad === ''
      ? 1
      : parsePositiveInteger(req.body.cantidad);
    const id_categoria = parsePositiveInteger(
      req.body.id_categoria ?? req.body.categoria_id ?? req.body.categoriaId
    );

    if (typeof titulo !== 'string' || !titulo.trim()) {
      return res.status(400).json({ error: 'INVALID_TITLE', message: 'El título de la prenda es obligatorio.' });
    }
    if (typeof talla !== 'string' || !talla.trim()) {
      return res.status(400).json({ error: 'INVALID_SIZE', message: 'La talla de la prenda es obligatoria.' });
    }
    if (!['NUEVO', 'COMO_NUEVO', 'BUEN_ESTADO', 'USADO'].includes(estado_prenda)) {
      return res.status(400).json({ error: 'INVALID_CONDITION', message: 'El estado de la prenda no es válido.' });
    }
    if (cantidad === null) {
      return res.status(400).json({ error: 'INVALID_QUANTITY', message: 'La cantidad debe ser un número entero mayor que cero.' });
    }
    if (id_categoria === null) {
      return res.status(400).json({ error: 'INVALID_CATEGORY', message: 'La categoría debe ser un ID numérico válido.' });
    }

    const prendaData = {
      titulo: titulo.trim(),
      descripcion: typeof descripcion === 'string' ? descripcion.trim() : '',
      talla: talla.trim(),
      estado_prenda,
      cantidad,
      id_categoria,
      imagen_url: req.file ? `/uploads/${req.file.filename}` : null
    };

    const prenda = await createPrendaService(prendaData, id_donante);
    res.status(201).json({ status: 'success', data: prenda });
  } catch (error: unknown) {
    console.error('Error en createPrendaCtrl:', error);
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error al eliminar la imagen de una prenda no guardada:', cleanupError);
      }
    }
    const code = (error as { code?: string })?.code;
    if (code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'INVALID_REFERENCE', message: 'El usuario o la categoría indicados no existen.' });
    }
    const message = error instanceof Error ? error.message : 'Error desconocido al guardar la prenda.';
    return res.status(500).json({ error: 'SERVER_ERROR', message });
  }
};
