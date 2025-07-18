// Ruta: src/presentation/routes/usuarios.ts (ACTUALIZAR SOLO LOS IMPORTS)

import { Router } from 'express';
import { UsuarioController } from '@/presentation/controllers/UsuarioController';
import { CreateUsuarioUseCase } from '@/application/use-cases/usuarios/CreateUsuarioUseCase';
import { GetUsuarioUseCase } from '@/application/use-cases/usuarios/GetUsuarioUseCase';
import { ListUsuariosUseCase } from '@/application/use-cases/usuarios/ListUsuariosUseCase';
import { UpdateUsuarioUseCase } from '@/application/use-cases/usuarios/UpdateUsuarioUseCase';
import { DeleteUsuarioUseCase } from '@/application/use-cases/usuarios/DeleteUsuarioUseCase';
import { GetUsuarioStatsUseCase } from '@/application/use-cases/usuarios/GetUsuarioStatsUseCase';
import { ChangePasswordUseCase, ResetPasswordUseCase } from '@/application/use-cases/usuarios/ChangePasswordUseCase';
import { UsuarioRepository } from '@/infrastructure/database/repositories/UsuarioRepository';
import { EmpresaRepository } from '@/infrastructure/database/repositories/EmpresaRepository';
import { SucursalRepository } from '@/infrastructure/database/repositories/SucursalRepository';
import { authMiddleware, requireRole } from '@/presentation/middleware/auth';
import { handleValidationErrors } from '@/presentation/middleware/validation';
import {
  createUsuarioValidator,
  updateUsuarioValidator,
  getUsuarioValidator,
  deleteUsuarioValidator,
  listUsuariosValidator,
  searchUsuariosValidator,
  changePasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  getStatsValidator,
  bulkUpdateStatusValidator,
  bulkDeleteValidator,
  checkEmailAvailabilityValidator,
  checkCedulaAvailabilityValidator
} from '@/presentation/validators/usuarioValidator';

const router = Router();

// ========== Dependency Injection ==========
const usuarioRepository = new UsuarioRepository();
const empresaRepository = new EmpresaRepository();
const sucursalRepository = new SucursalRepository();

const createUsuarioUseCase = new CreateUsuarioUseCase(usuarioRepository, empresaRepository, sucursalRepository);
const getUsuarioUseCase = new GetUsuarioUseCase(usuarioRepository);
const listUsuariosUseCase = new ListUsuariosUseCase(usuarioRepository);
const updateUsuarioUseCase = new UpdateUsuarioUseCase(usuarioRepository, empresaRepository, sucursalRepository);
const deleteUsuarioUseCase = new DeleteUsuarioUseCase(usuarioRepository);
const getUsuarioStatsUseCase = new GetUsuarioStatsUseCase(usuarioRepository);
const changePasswordUseCase = new ChangePasswordUseCase(usuarioRepository);
const resetPasswordUseCase = new ResetPasswordUseCase(usuarioRepository);

const usuarioController = new UsuarioController(
  createUsuarioUseCase,
  getUsuarioUseCase,
  listUsuariosUseCase,
  updateUsuarioUseCase,
  deleteUsuarioUseCase,
  getUsuarioStatsUseCase,
  changePasswordUseCase,
  resetPasswordUseCase
);

// ========== Aplicar Middleware de Autenticación a Todas las Rutas ==========
router.use(authMiddleware);

// ========== Rutas de Perfil (Usuario Autenticado) ==========

// GET /api/usuarios/profile - Obtener perfil del usuario autenticado
router.get('/profile', usuarioController.getProfile);

// PUT /api/usuarios/profile - Actualizar perfil del usuario autenticado
router.put(
  '/profile',
  updateProfileValidator,
  handleValidationErrors,
  usuarioController.updateProfile
);

// PUT /api/usuarios/profile/password - Cambiar contraseña propia
router.put(
  '/profile/password',
  changePasswordValidator,
  handleValidationErrors,
  usuarioController.changePassword
);

// ========== Rutas de Búsqueda y Listado ==========

// GET /api/usuarios/search - Buscar usuarios
router.get(
  '/search',
  searchUsuariosValidator,
  handleValidationErrors,
  usuarioController.search
);

// GET /api/usuarios/stats - Obtener estadísticas de usuarios
router.get(
  '/stats',
  requireRole('super_admin', 'admin', 'manager'),
  getStatsValidator,
  handleValidationErrors,
  usuarioController.getStats
);

// GET /api/usuarios - Listar usuarios
router.get(
  '/',
  listUsuariosValidator,
  handleValidationErrors,
  usuarioController.list
);

// ========== Rutas de Verificación de Disponibilidad ==========

// GET /api/usuarios/check-email - Verificar disponibilidad de email
router.get(
  '/check-email',
  requireRole('super_admin', 'admin', 'manager'),
  checkEmailAvailabilityValidator,
  handleValidationErrors,
  usuarioController.checkEmailAvailability
);

// GET /api/usuarios/check-cedula - Verificar disponibilidad de cédula
router.get(
  '/check-cedula',
  requireRole('super_admin', 'admin', 'manager'),
  checkCedulaAvailabilityValidator,
  handleValidationErrors,
  usuarioController.checkCedulaAvailability
);

// ========== Rutas CRUD ==========

// POST /api/usuarios - Crear usuario (admin+)
router.post(
  '/',
  requireRole('super_admin', 'admin', 'manager'),
  createUsuarioValidator,
  handleValidationErrors,
  usuarioController.create
);

// GET /api/usuarios/:id - Obtener usuario por ID
router.get(
  '/:id',
  getUsuarioValidator,
  handleValidationErrors,
  usuarioController.get
);

// PUT /api/usuarios/:id - Actualizar usuario (admin+)
router.put(
  '/:id',
  requireRole('super_admin', 'admin', 'manager'),
  updateUsuarioValidator,
  handleValidationErrors,
  usuarioController.update
);

// DELETE /api/usuarios/:id - Eliminar usuario (admin+)
router.delete(
  '/:id',
  requireRole('super_admin', 'admin', 'manager'),
  deleteUsuarioValidator,
  handleValidationErrors,
  usuarioController.delete
);

// ========== Rutas de Gestión de Contraseñas ==========

// PUT /api/usuarios/:id/password - Cambiar contraseña de otro usuario (admin+)
router.put(
  '/:id/password',
  requireRole('super_admin', 'admin', 'manager'),
  changePasswordValidator,
  handleValidationErrors,
  usuarioController.changePassword
);

// PUT /api/usuarios/:id/reset-password - Resetear contraseña (admin+)
router.put(
  '/:id/reset-password',
  requireRole('super_admin', 'admin'),
  resetPasswordValidator,
  handleValidationErrors,
  usuarioController.resetPassword
);

// ========== Rutas de Operaciones Masivas ==========

// PUT /api/usuarios/bulk/status - Actualizar estado masivo (admin+)
router.put(
  '/bulk/status',
  requireRole('super_admin', 'admin'),
  bulkUpdateStatusValidator,
  handleValidationErrors,
  usuarioController.bulkUpdateStatus
);

// DELETE /api/usuarios/bulk - Eliminación masiva (admin+)
router.delete(
  '/bulk',
  requireRole('super_admin', 'admin'),
  bulkDeleteValidator,
  handleValidationErrors,
  usuarioController.bulkDelete
);

export { router as usuarioRoutes };