import cors from 'cors';
import express from 'express';
import path from 'node:path';
import authRoutes from './routes/auth.routes';
import prendaRoutes from './routes/prenda.routes';
import solicitudRoutes from './routes/solicitud.routes';

const app = express();
const uploadsDirectory = path.resolve(process.cwd(), 'uploads');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDirectory));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'API ClothLink está corriendo correctamente' });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/prendas', prendaRoutes);
app.use('/api/solicitudes', solicitudRoutes);
export default app;
