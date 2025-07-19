// Ruta: src/presentation/routes/index.ts (ACTUALIZAR)

import { Router } from 'express';
import { authRoutes } from './auth';
import { empresaRoutes } from './empresas';
import { sucursalRoutes } from './sucursales';
import { usuarioRoutes } from './usuarios';
import { departamentoRoutes } from './departamentos'; // NUEVO
import { areaRoutes } from './areas'; // NUEVO

const router = Router();

// Registrar todas las rutas
router.use('/auth', authRoutes);
router.use('/empresas', empresaRoutes);
router.use('/sucursales', sucursalRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/departamentos', departamentoRoutes); // NUEVO
router.use('/areas', areaRoutes); // NUEVO

// Ruta de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      empresas: '/api/empresas',
      sucursales: '/api/sucursales',
      usuarios: '/api/usuarios',
      departamentos: '/api/departamentos', // NUEVO
      areas: '/api/areas' // NUEVO
    }
  });
});

export default router;