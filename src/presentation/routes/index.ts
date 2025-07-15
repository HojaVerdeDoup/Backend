import { Router } from 'express';
import {authRoutes} from './auth';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

export default router;
