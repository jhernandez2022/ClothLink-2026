import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.handle';

export interface CustomRequest extends Request {
  user?: { id?: number; id_usuario?: number; id_rol: number };
}

export const checkJwt = (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const jwtByUser = req.headers.authorization || '';
    const jwtToken = jwtByUser.split(' ').pop();

    if (!jwtToken) {
      return res.status(401).json({ error: 'NO_TOKEN_PROVIDED', message: 'Token no proporcionado' });
    }

    const isUser = verifyToken(jwtToken) as { id: number; id_rol: number };
    req.user = isUser;
    next();
  } catch (e) {
    res.status(400).json({ error: 'INVALID_SESSION', message: 'Sesión inválida o expirada' });
  }
};

export const checkRole = (rolesPermitidos: number[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Usuario no autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.id_rol)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'No tienes permisos para esta acción' });
    }

    next();
  };
};
