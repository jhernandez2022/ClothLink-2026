"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const solicitud_controller_1 = require("../controllers/solicitud.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/', auth_middleware_1.checkJwt, (0, auth_middleware_1.checkRole)([2, 3]), solicitud_controller_1.crearSolicitud); // Donantes y organizaciones pueden solicitar
router.get('/recibidas', auth_middleware_1.checkJwt, (0, auth_middleware_1.checkRole)([2]), solicitud_controller_1.obtenerSolicitudesRecibidas); // Solo Donante
router.patch('/:id', auth_middleware_1.checkJwt, (0, auth_middleware_1.checkRole)([2]), solicitud_controller_1.cambiarEstadoSolicitud);
router.patch('/:id/estado', auth_middleware_1.checkJwt, solicitud_controller_1.cambiarEstadoSolicitud);
exports.default = router;
