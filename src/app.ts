// Ruta: src/app.ts (ACTUALIZAR ARCHIVO EXISTENTE)

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './infrastructure/config/environment';
import { authRoutes } from '@/presentation/routes/auth';
import { empresaRoutes } from '@/presentation/routes/empresas';
import { sucursalRoutes } from '@/presentation/routes/sucursales';
import { usuarioRoutes } from '@/presentation/routes/usuarios'; // NUEVO
import { errorHandler, notFoundHandler } from '@/presentation/middleware/errorHandler';

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: 'Demasiadas solicitudes, intenta de nuevo más tarde',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware de seguridad
app.use(helmet());
app.use(limiter);

// CORS
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: process.env.npm_package_version || '1.0.0',
    features: {
      auth: '✅ Autenticación JWT',
      empresas: '✅ Gestión de Empresas',
      sucursales: '✅ Gestión de Sucursales',
      usuarios: '✅ Gestión Completa de Usuarios' // NUEVO
    },
    endpoints: {
      auth: '/api/auth',
      empresas: '/api/empresas',
      sucursales: '/api/sucursales',
      usuarios: '/api/usuarios' // NUEVO
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/usuarios', usuarioRoutes); // NUEVO

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;