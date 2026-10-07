"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUserService = exports.registerUserService = void 0;
const db_1 = require("../database/db");
const jwt_handle_1 = require("../utils/jwt.handle");
const password_handle_1 = require("../utils/password.handle");
const registerUserService = async (userData) => {
    const { nombre, email, password, telefono, direccion, id_rol } = userData;
    // Verificar si el correo ya existe
    const [existingUser] = await db_1.pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
        throw new Error('EMAIL_ALREADY_EXISTS');
    }
    // Encriptar contraseña
    const passwordHash = await (0, password_handle_1.encryptPassword)(password);
    // Insertar nuevo usuario
    const [result] = await db_1.pool.query('INSERT INTO usuarios (nombre, email, password, telefono, direccion, id_rol) VALUES (?, ?, ?, ?, ?, ?)', [nombre, email, passwordHash, telefono || null, direccion || null, id_rol || 2]);
    return { id_usuario: result.insertId, nombre, email, id_rol: id_rol || 2 };
};
exports.registerUserService = registerUserService;
const loginUserService = async ({ email, password }) => {
    // Buscar usuario
    const [rows] = await db_1.pool.query('SELECT * FROM usuarios WHERE email = ? AND activo = TRUE', [email]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = rows[0];
    // Verificar contraseña
    const isCorrect = await (0, password_handle_1.verifyPassword)(password, user.password);
    if (!isCorrect) {
        throw new Error('INVALID_PASSWORD');
    }
    // Generar JWT
    const token = (0, jwt_handle_1.generateToken)(user.id_usuario, user.id_rol);
    return {
        token,
        user: {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            email: user.email,
            id_rol: user.id_rol
        }
    };
};
exports.loginUserService = loginUserService;
