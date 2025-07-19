// Ruta: src/presentation/routes/departamentos.ts

import { Router } from 'express';
import { DepartamentoController } from '../controllers/DepartamentoController';
import { CreateDepartamentoUseCase } from '../../application/use-cases/departamentos/CreateDepartamentoUseCase';
import { GetDepartamentoUseCase } from '../../application/use-cases/departamentos/GetDepartamentoUseCase';
import { ListDepartamentosUseCase } from '../../application/use-cases/departamentos/ListDepartamentosUseCase';
import { UpdateDepartamentoUseCase } from '../../application/use-cases/departamentos/UpdateDepartamentoUseCase';
import { DeleteDepartamentoUseCase } from '../../application/use-cases/departamentos/DeleteDepartamentoUseCase';
import { GetDepartamentoJerarquiaUseCase } from '../../application/use-cases/departamentos/GetDepartamentoJerarquiaUseCase';
import { DepartamentoRepository } from '../../infrastructure/database/repositories/DepartamentoRepository';
import { EmpresaRepository } from '../../infrastructure/database/repositories/EmpresaRepository';
import { UsuarioRepository } from '../../infrastructure/database/repositories/UsuarioRepository';
import { authMiddleware, requireRole, requireSameEmpresa } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import {
  createDepartamentoValidator,
  updateDepartamentoValidator,
  getDepartamentoValidator,
  deleteDepartamentoValidator,
  listDepartamentosValidator,
  getJerarquiaValidator,
  validateJerarquiaValidator,
  getPosiblesPadresValidator
} from '../validators/departamentoValidator';

const router = Router();

// Dependency injection
const departamentoRepository = new DepartamentoRepository();
const empresaRepository = new EmpresaRepository();
const usuarioRepository = new UsuarioRepository();

const createDepartamentoUseCase = new CreateDepartamentoUseCase(
  departamentoRepository,
  empresaRepository,
  usuarioRepository
);
const getDepartamentoUseCase = new GetDepartamentoUseCase(
  departamentoRepository,
  empresaRepository,
  usuarioRepository
);
const listDepartamentosUseCase = new ListDepartamentosUseCase(departamentoRepository);
const updateDepartamentoUseCase = new UpdateDepartamentoUseCase(
  departamentoRepository,
  empresaRepository,
  usuarioRepository
);
const deleteDepartamentoUseCase = new DeleteDepartamentoUseCase(departamentoRepository);
const getDepartamentoJerarquiaUseCase = new GetDepartamentoJerarquiaUseCase(departamentoRepository);

const departamentoController = new DepartamentoController(
  createDepartamentoUseCase,
  getDepartamentoUseCase,
  listDepartamentosUseCase,
  updateDepartamentoUseCase,
  deleteDepartamentoUseCase,
  getDepartamentoJerarquiaUseCase
);

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// ========== RUTAS PRINCIPALES ==========

// POST /api/departamentos - Crear departamento (admin+)
router.post(
  '/',
  requireRole('super_admin', 'admin'),
  createDepartamentoValidator,
  handleValidationErrors,
  requireSameEmpresa,
  departamentoController.create
);

// GET /api/departamentos - Listar departamentos
router.get(
  '/',
  listDepartamentosValidator,
  handleValidationErrors,
  departamentoController.list
);

// GET /api/departamentos/jerarquia - Obtener jerarquía completa
router.get(
  '/jerarquia',
  getJerarquiaValidator,
  handleValidationErrors,
  departamentoController.getJerarquia
);

// GET /api/departamentos/posibles-padres - Obtener posibles departamentos padre
router.get(
  '/posibles-padres',
  getPosiblesPadresValidator,
  handleValidationErrors,
  departamentoController.getPosiblesPadres
);

// GET /api/departamentos/validate-jerarquia - Validar jerarquía
router.get(
  '/validate-jerarquia',
  validateJerarquiaValidator,
  handleValidationErrors,
  departamentoController.validateJerarquia
);

// GET /api/departamentos/:id - Obtener departamento por ID
router.get(
  '/:id',
  getDepartamentoValidator,
  handleValidationErrors,
  departamentoController.get
);

// PUT /api/departamentos/:id - Actualizar departamento (admin+)
router.put(
  '/:id',
  requireRole('super_admin', 'admin'),
  updateDepartamentoValidator,
  handleValidationErrors,
  departamentoController.update
);

// DELETE /api/departamentos/:id - Eliminar departamento (admin+)
router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  deleteDepartamentoValidator,
  handleValidationErrors,
  departamentoController.delete
);

export { router as departamentoRoutes };