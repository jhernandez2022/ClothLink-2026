"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const promise_1 = __importDefault(require("mysql2/promise"));
dotenv_1.default.config();
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'clothlink_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.pool.getConnection()
    .then((conn) => {
    console.log(' Conexión a MySQL establecida correctamente.');
    conn.release();
})
    .catch((err) => {
    console.error(' Error conectando a MySQL:', err.message);
});
