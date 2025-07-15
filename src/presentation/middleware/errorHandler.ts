import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError } from '@/shared/errors/AppError';
import { config } from '@/infrastructure/config/environment';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Error personalizado de la aplicación
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      ...(config.nodeEnv === 'development' && { stack: error.stack })
    });
    return;
  }

  // Error de validación de JWT
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN'
    });
    return;
  }

  // Error de token expirado
  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED'
    });
    return;
  }

  // Error de Supabase
  if (error.message.includes('duplicate key value')) {
    res.status(409).json({
      success: false,
      error: 'El recurso ya existe',
      code: 'DUPLICATE_RESOURCE'
    });
    return;
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    error: config.nodeEnv === 'development' ? error.message : 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
    ...(config.nodeEnv === 'development' && { stack: error.stack })
  });
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.path} no encontrada`,
    code: 'ROUTE_NOT_FOUND'
  });
};