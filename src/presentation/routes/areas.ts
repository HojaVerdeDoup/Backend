// Ruta: src/presentation/routes/areas.ts (ARCHIVO COMPLETO CORREGIDO)

import { Router } from 'express';
import { query, param } from 'express-validator';
import { AreaController } from '../controllers/AreaController';
import { CreateAreaUseCase } from '../../application/use-cases/areas/CreateAreaUseCase';
import { GetAreaUseCase } from '../../application/use-cases/areas/GetAreaUseCase';
import { ListAreasUseCase } from '../../application/use-cases/areas/ListAreasUseCase';
import { UpdateAreaUseCase } from '../../application/use-cases/areas/UpdateAreaUseCase';
import { DeleteAreaUseCase } from '../../application/use-cases/areas/DeleteAreaUseCase';
import { GetAreaEstadisticasUseCase } from '../../application/use-cases/areas/GetAreaEstadisticasUseCase';
import { AreaRepository } from '../../infrastructure/database/repositories/AreaRepository';
import { EmpresaRepository } from '../../infrastructure/database/repositories/EmpresaRepository';
import { SucursalRepository } from '../../infrastructure/database/repositories/SucursalRepository';
import { DepartamentoRepository } from '../../infrastructure/database/repositories/DepartamentoRepository';
import { UsuarioRepository } from '../../infrastructure/database/repositories/UsuarioRepository';
import { authMiddleware, requireRole } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import {
  createAreaValidator,
  updateAreaValidator,
  getAreaValidator,
  deleteAreaValidator,
  listAreasValidator,
  getBySucursalValidator,
  getByDepartamentoValidator,
  copyHorariosValidator,
  getEstadisticasValidator
} from '../validators/areaValidator';

const router = Router();

// Dependency injection
const areaRepository = new AreaRepository();
const empresaRepository = new EmpresaRepository();
const sucursalRepository = new SucursalRepository();
const departamentoRepository = new DepartamentoRepository();
const usuarioRepository = new UsuarioRepository();

const createAreaUseCase = new CreateAreaUseCase(
  areaRepository,
  empresaRepository,
  sucursalRepository,
  departamentoRepository,
  usuarioRepository
);
const getAreaUseCase = new GetAreaUseCase(
  areaRepository,
  empresaRepository,
  sucursalRepository,
  departamentoRepository,
  usuarioRepository
);
const listAreasUseCase = new ListAreasUseCase(areaRepository);
const updateAreaUseCase = new UpdateAreaUseCase(
  areaRepository,
  empresaRepository,
  sucursalRepository,
  departamentoRepository,
  usuarioRepository
);
const deleteAreaUseCase = new DeleteAreaUseCase(areaRepository);
const getAreaEstadisticasUseCase = new GetAreaEstadisticasUseCase(areaRepository);

const areaController = new AreaController(
  createAreaUseCase,
  getAreaUseCase,
  listAreasUseCase,
  updateAreaUseCase,
  deleteAreaUseCase,
  getAreaEstadisticasUseCase
);

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// ========== RUTAS PRINCIPALES ==========

// POST /api/areas - Crear área (admin+)
router.post(
  '/',
  requireRole('super_admin', 'admin'),
  createAreaValidator,
  handleValidationErrors,
  areaController.create
);

// GET /api/areas - Listar áreas
router.get(
  '/',
  listAreasValidator,
  handleValidationErrors,
  areaController.list
);

// GET /api/areas/estadisticas - Obtener estadísticas de áreas
router.get(
  '/estadisticas',
  getEstadisticasValidator,
  handleValidationErrors,
  areaController.getEstadisticas
);

// GET /api/areas/default-dias-laborables - Obtener template de días laborables
router.get(
  '/default-dias-laborables',
  areaController.getDefaultDiasLaborables
);

// GET /api/areas/sucursal/:sucursalId - Obtener áreas por sucursal
router.get(
  '/sucursal/:sucursalId',
  getBySucursalValidator,
  handleValidationErrors,
  areaController.getBySucursal
);

// GET /api/areas/departamento/:departamentoId - Obtener áreas por departamento
router.get(
  '/departamento/:departamentoId',
  getByDepartamentoValidator,
  handleValidationErrors,
  areaController.getByDepartamento
);

// GET /api/areas/check-codigo - Verificar disponibilidad de código (nuevo)
router.get(
  '/check-codigo',
  query('codigo')
    .trim()
    .matches(/^[A-Z0-9]{2,10}$/)
    .withMessage('Código debe tener entre 2-10 caracteres alfanuméricos en mayúsculas'),
  query('sucursal_id')
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),
  handleValidationErrors,
  areaController.checkCodigoAvailability
);

// GET /api/areas/check-codigo/:id - Verificar disponibilidad de código (actualización)
router.get(
  '/check-codigo/:id',
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),
  query('codigo')
    .trim()
    .matches(/^[A-Z0-9]{2,10}$/)
    .withMessage('Código debe tener entre 2-10 caracteres alfanuméricos en mayúsculas'),
  query('sucursal_id')
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),
  handleValidationErrors,
  areaController.checkCodigoAvailability
);

// GET /api/areas/:id - Obtener área por ID
router.get(
  '/:id',
  getAreaValidator,
  handleValidationErrors,
  areaController.get
);

// PUT /api/areas/copy-horarios - Copiar horarios entre áreas (admin+)
router.put(
  '/copy-horarios',
  requireRole('super_admin', 'admin', 'manager'),
  copyHorariosValidator,
  handleValidationErrors,
  areaController.copyHorarios
);

// PUT /api/areas/:id - Actualizar área (admin+)
router.put(
  '/:id',
  requireRole('super_admin', 'admin'),
  updateAreaValidator,
  handleValidationErrors,
  areaController.update
);

// DELETE /api/areas/:id - Eliminar área (admin+)
router.delete(
  '/:id',
  requireRole('super_admin', 'admin'),
  deleteAreaValidator,
  handleValidationErrors,
  areaController.delete
);

export { router as areaRoutes };