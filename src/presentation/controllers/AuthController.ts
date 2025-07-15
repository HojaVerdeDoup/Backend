import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '@/application/use-cases/auth/RefreshTokenUseCase';
import { ApiResponse } from '@/shared/types/common';

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private registerUseCase: RegisterUseCase,
    private refreshTokenUseCase: RefreshTokenUseCase
  ) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      
      const result = await this.loginUseCase.execute({ email, password });
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Login exitoso'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      
      const result = await this.registerUseCase.execute(userData);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Usuario registrado exitosamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      const result = await this.refreshTokenUseCase.execute({ refreshToken });
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Token renovado exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // En una implementación real, aquí invalidarías el token en una blacklist
      const response: ApiResponse<null> = {
        success: true,
        message: 'Logout exitoso'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // El usuario viene del middleware de auth
      const user = (req as any).user;
      
      const response: ApiResponse<typeof user> = {
        success: true,
        data: user,
        message: 'Perfil obtenido exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}