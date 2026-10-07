"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const prenda_routes_1 = __importDefault(require("./routes/prenda.routes"));
const solicitud_routes_1 = __importDefault(require("./routes/solicitud.routes"));
const app = (0, express_1.default)();
const uploadsDirectory = node_path_1.default.resolve(process.cwd(), 'uploads');
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(uploadsDirectory));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'OK', message: 'API ClothLink está corriendo correctamente' });
});
// Rutas API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/prendas', prenda_routes_1.default);
app.use('/api/solicitudes', solicitud_routes_1.default);
exports.default = app;
