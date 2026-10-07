"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_clothlink_2026';
const generateToken = (id, id_rol) => {
    const jwtToken = jsonwebtoken_1.default.sign({ id, id_rol }, JWT_SECRET, {
        expiresIn: '8h'
    });
    return jwtToken;
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    const isOk = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    return isOk;
};
exports.verifyToken = verifyToken;
