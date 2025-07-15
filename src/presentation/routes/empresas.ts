//Ruta: src/presentation/routes/empresas.ts

import { Router } from 'express';
import { EmpresaController } from '@/presentation/controllers/EmpresaController';
import { CreateEmpresaUseCase } from '@/application/use-cases/empresas/CreateEmpresaUseCase';
import { GetEmpresaUseCase } from '@/application/use-cases/empresas/GetEmpresaUseCase';
import { ListEmpresasUseCase } from '@/application/use-cases/empresas/ListEmpresasUseCase';
import { UpdateEmpresaUseCase } from '@/application/use-cases/empresas/UpdateEmpresaUseCase';
import { DeleteEmpresaUseCase } from '@/application/use-cases/empresas/DeleteEmpresaUseCase';
import { EmpresaRepository } from '@/infrastructure/database/repositories/EmpresaRepository';
import { SucursalRepository } from '@/infrastructure/database/repositories/SucursalRepository';
import { authMiddleware, requireRole } from '@/presentation/middleware/auth';
import { handleValidationErrors } from '@/presentation/middleware/validation';
import {
  createEmpresaValidator,
  updateEmpresaValidator,
  getEmpresaValidator,
  deleteEmpresaValidator,
  listEmpresasValidator
} from '@/presentation/validators/empresaValidator';

const router = Router();

// Dependency injection
const empresaRepository = new EmpresaRepository();
const sucursalRepository = new SucursalRepository();

const createEmpresaUseCase = new CreateEmpresaUseCase(empresaRepository);
const getEmpresaUseCase = new GetEmpresaUseCase(empresaRepository, sucursalRepository);
const listEmpresasUseCase = new ListEmpresasUseCase(empresaRepository);
const updateEmpresaUseCase = new UpdateEmpresaUseCase(empresaRepository);
const deleteEmpresaUseCase = new DeleteEmpresaUseCase(empresaRepository, sucursalRepository);

const empresaController = new EmpresaController(
  createEmpresaUseCase,
  getEmpresaUseCase,
  listEmpresasUseCase,
  updateEmpresaUseCase,
  deleteEmpresaUseCase
);

// Rutas protegidas
router.use(authMiddleware);

// POST /api/empresas - Crear empresa (solo super_admin)
router.post(
  '/',
  requireRole('super_admin'),
  createEmpresaValidator,
  handleValidationErrors,
  empresaController.create
);

// GET /api/empresas - Listar empresas
router.get(
  '/',
  listEmpresasValidator,
  handleValidationErrors,
  empresaController.list
);

// GET /api/empresas/:id - Obtener empresa por ID
router.get(
  '/:id',
  getEmpresaValidator,
  handleValidationErrors,
  empresaController.get
);

// PUT /api/empresas/:id - Actualizar empresa (solo super_admin)
router.put(
  '/:id',
  requireRole('super_admin'),
  updateEmpresaValidator,
  handleValidationErrors,
  empresaController.update
);

// DELETE /api/empresas/:id - Eliminar empresa (solo super_admin)
router.delete(
  '/:id',
  requireRole('super_admin'),
  deleteEmpresaValidator,
  handleValidationErrors,
  empresaController.delete
);

export { router as empresaRoutes };