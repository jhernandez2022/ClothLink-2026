import { Request, Response } from 'express';
import { loginUserService, registerUserService } from '../services/auth.service';

export const registerCtrl = async (req: Request, res: Response) => {
  try {
    const response = await registerUserService(req.body);
    res.status(201).json({ status: 'success', data: response });
  } catch (error: any) {
    if (error.message === 'EMAIL_ALREADY_EXISTS') {
      return res.status(400).json({ error: error.message, message: 'El correo electrónico ya está registrado' });
    }
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};

export const loginCtrl = async (req: Request, res: Response) => {
  try {
    const response = await loginUserService(req.body);
    res.status(200).json({ status: 'success', data: response });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' });
    }
    res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
  }
};
