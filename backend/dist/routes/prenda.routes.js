"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_crypto_1 = require("node:crypto");
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const multer_1 = __importDefault(require("multer"));
const prenda_controller_1 = require("../controllers/prenda.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const uploadsDirectory = node_path_1.default.resolve(process.cwd(), 'uploads');
const allowedImageTypes = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif'
};
(0, node_fs_1.mkdirSync)(uploadsDirectory, { recursive: true });
const uploadImage = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: uploadsDirectory,
        filename: (_req, file, callback) => {
            callback(null, `${(0, node_crypto_1.randomUUID)()}${allowedImageTypes[file.mimetype] || '.img'}`);
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
const parseImageUpload = (req, res, next) => {
    uploadImage.single('imagen')(req, res, (error) => {
        if (!error) {
            next();
            return;
        }
        if (error instanceof multer_1.default.MulterError && error.code === 'LIMIT_FILE_SIZE') {
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
router.get('/', prenda_controller_1.getPrendasCtrl);
router.delete('/:id', auth_middleware_1.checkJwt, (0, auth_middleware_1.checkRole)([2]), prenda_controller_1.deletePrendaCtrl);
// Crear prenda (Solo Donantes - Rol 2 o Admin - Rol 1)
router.post('/', auth_middleware_1.checkJwt, (0, auth_middleware_1.checkRole)([1, 2]), parseImageUpload, prenda_controller_1.createPrendaCtrl);
exports.default = router;
