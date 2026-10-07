import { Router } from 'express';
import {
    cambiarEstadoSolicitud,
    crearSolicitud,
    obtenerSolicitudesRecibidas
} from '../controllers/solicitud.controller';
import { checkJwt, checkRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', checkJwt, checkRole([2, 3]), crearSolicitud); // Donantes y organizaciones pueden solicitar
router.get('/recibidas', checkJwt, checkRole([2]), obtenerSolicitudesRecibidas); // Solo Donante
router.patch('/:id', checkJwt, checkRole([2]), cambiarEstadoSolicitud);
router.patch('/:id/estado', checkJwt, cambiarEstadoSolicitud);

export default router;
