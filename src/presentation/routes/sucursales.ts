//Ruta: src/presentation/routes/sucursales.ts

import { Router } from 'express';
import { SucursalController } from '@/presentation/controllers/SucursalController';
import { CreateSucursalUseCase } from '@/application/use-cases/sucursales/CreateSucursalUseCase';
import { GetSucursalUseCase } from '@/application/use-cases/sucursales/GetSucursalUseCase';
import { ListSucursalesUseCase } from '@/application/use-cases/sucursales/ListSucursalesUseCase';
import { UpdateSucursalUseCase } from '@/application/use-cases/sucursales/UpdateSucursalUseCase';
import { DeleteSucursalUseCase } from '@/application/use-cases/sucursales/DeleteSucursalUseCase';
import { SucursalRepository } from '@/infrastructure/database/repositories/SucursalRepository';
import { EmpresaRepository } from '@/infrastructure/database/repositories/EmpresaRepository';
import { authMiddleware, requireRole } from '@/presentation/middleware/auth';
import { handleValidationErrors } from '@/presentation/middleware/validation';
import {
  createSucursalValidator,
  updateSucursalValidator,
  getSucursalValidator,
  deleteSucursalValidator,
  listSucursalesValidator
} from '@/presentation/validators/sucursalValidator';

const router = Router();

// Dependency injection
const sucursalRepository = new SucursalRepository();
const empresaRepository = new EmpresaRepository();

const createSucursalUseCase = new CreateSucursalUseCase(sucursalRepository, empresaRepository);
const getSucursalUseCase = new GetSucursalUseCase(sucursalRepository, empresaRepository);
const listSucursalesUseCase = new ListSucursalesUseCase(sucursalRepository);
const updateSucursalUseCase = new UpdateSucursalUseCase(sucursalRepository);
const deleteSucursalUseCase = new DeleteSucursalUseCase(sucursalRepository);

const sucursalController = new SucursalController(
  createSucursalUseCase,
  getSucursalUseCase,
  listSucursalesUseCase,
  updateSucursalUseCase,
  deleteSucursalUseCase
);

// Rutas protegidas
router.use(authMiddleware);

// POST /api/sucursales - Crear sucursal (admin+)
router.post(
  '/',
  requireRole('super_admin', 'admin'),
  createSucursalValidator,
  handleValidationErrors,
  sucursalController.create
);

// GET /api/sucursales - Listar sucursales
router.get(
  '/',
  listSucursalesValidator,
  handleValidationErrors,
  sucursalController.list
);

// GET /api/sucursales/:id - Obtener sucursal por ID
router.get(
  '/:id',
  getSucursalValidator,
  handleValidationErrors,
  sucursalController.get
);

// PUT /api/sucursales/:id - Actualizar sucursal (admin+)
router.put(
  '/:id',
  requireRole('super_admin', 'admin'),
  updateSucursalValidator,
  handleValidationErrors,
  sucursalController.update
);

// DELETE /api/sucursales/:id - Eliminar sucursal (admin+)
router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  deleteSucursalValidator,
  handleValidationErrors,
  sucursalController.delete
);

export { router as sucursalRoutes };