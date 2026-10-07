"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCtrl = exports.registerCtrl = void 0;
const auth_service_1 = require("../services/auth.service");
const registerCtrl = async (req, res) => {
    try {
        const response = await (0, auth_service_1.registerUserService)(req.body);
        res.status(201).json({ status: 'success', data: response });
    }
    catch (error) {
        if (error.message === 'EMAIL_ALREADY_EXISTS') {
            return res.status(400).json({ error: error.message, message: 'El correo electrónico ya está registrado' });
        }
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};
exports.registerCtrl = registerCtrl;
const loginCtrl = async (req, res) => {
    try {
        const response = await (0, auth_service_1.loginUserService)(req.body);
        res.status(200).json({ status: 'success', data: response });
    }
    catch (error) {
        if (error.message === 'USER_NOT_FOUND' || error.message === 'INVALID_PASSWORD') {
            return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas' });
        }
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};
exports.loginCtrl = loginCtrl;
