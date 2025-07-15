import { Router } from 'express';
import { AuthController } from '@/presentation/controllers/AuthController';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/RefreshTokenUseCase';
import { UsuarioRepository } from '@/infrastructure/database/repositories/UsuarioRepository';
import { authMiddleware } from '@/presentation/middleware/auth';
import { handleValidationErrors } from '@/presentation/middleware/validation';
import { loginValidator, registerValidator, refreshTokenValidator } from '@/presentation/validators/authValidator';

const router = Router();

// Dependency injection
const usuarioRepository = new UsuarioRepository();
const loginUseCase = new LoginUseCase(usuarioRepository);
const registerUseCase = new RegisterUseCase(usuarioRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(usuarioRepository);

const authController = new AuthController(
  loginUseCase,
  registerUseCase,
  refreshTokenUseCase
);

// Rutas públicas
router.post('/login', loginValidator, handleValidationErrors, authController.login);
router.post('/register', registerValidator, handleValidationErrors, authController.register);
router.post('/refresh', refreshTokenValidator, handleValidationErrors, authController.refreshToken);

// Rutas protegidas
router.post('/logout', authMiddleware, authController.logout);
router.get('/me', authMiddleware, authController.me);

export { router as authRoutes };