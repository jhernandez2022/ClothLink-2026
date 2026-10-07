import { RequestHandler, Router } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { createPrendaCtrl, deletePrendaCtrl, getPrendasCtrl } from '../controllers/prenda.controller';
import { checkJwt, checkRole } from '../middlewares/auth.middleware';

const router = Router();
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');
const allowedImageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

mkdirSync(uploadsDirectory, { recursive: true });

const uploadImage = multer({
  storage: multer.diskStorage({
    destination: uploadsDirectory,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${allowedImageTypes[file.mimetype] || '.img'}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedImageTypes[file.mimetype]) {
      callback(new Error('El formato de imagen no está permitido.'));
      return;
    }
    callback(null, true);
  }
});

const parseImageUpload: RequestHandler = (req, res, next) => {
  uploadImage.single('imagen')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'IMAGE_TOO_LARGE', message: 'La imagen no puede superar los 5 MB.' });
      return;
    }
    if (error instanceof Error) {
      res.status(400).json({ error: 'INVALID_IMAGE', message: error.message });
      return;
    }
    next(error);
  });
};

// Ver prendas disponibles (Público o Autenticado)
router.get('/', getPrendasCtrl);
router.delete('/:id', checkJwt, checkRole([2]), deletePrendaCtrl);

// Crear prenda (Solo Donantes - Rol 2 o Admin - Rol 1)
router.post('/', checkJwt, checkRole([1, 2]), parseImageUpload, createPrendaCtrl);

export default router;
