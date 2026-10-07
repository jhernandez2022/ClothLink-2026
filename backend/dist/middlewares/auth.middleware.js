"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.checkJwt = void 0;
const jwt_handle_1 = require("../utils/jwt.handle");
const checkJwt = (req, res, next) => {
    try {
        const jwtByUser = req.headers.authorization || '';
        const jwtToken = jwtByUser.split(' ').pop();
        if (!jwtToken) {
            return res.status(401).json({ error: 'NO_TOKEN_PROVIDED', message: 'Token no proporcionado' });
        }
        const isUser = (0, jwt_handle_1.verifyToken)(jwtToken);
        req.user = isUser;
        next();
    }
    catch (e) {
        res.status(400).json({ error: 'INVALID_SESSION', message: 'Sesión inválida o expirada' });
    }
};
exports.checkJwt = checkJwt;
const checkRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Usuario no autenticado' });
        }
        if (!rolesPermitidos.includes(req.user.id_rol)) {
            return res.status(403).json({ error: 'FORBIDDEN', message: 'No tienes permisos para esta acción' });
        }
        next();
    };
};
exports.checkRole = checkRole;
