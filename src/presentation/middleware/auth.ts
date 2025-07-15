import { Request, Response, NextFunction } from 'express';
import { AuthConfig } from '@/infrastructure/config/auth';
import { UsuarioRepository } from '@/infrastructure/database/repositories/UsuarioRepository';
import { UnauthorizedError } from '@/shared/errors/AppError';

interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: string;
  empresaId?: string;
  sucursalId?: string;
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.substring(7);
    
    // Verificar token
    const payload = AuthConfig.verifyToken(token);
    
    // Buscar usuario para verificar que aún existe y está activo
    const usuarioRepository = new UsuarioRepository();
    const usuario = await usuarioRepository.findById(payload.userId);
    
    if (!usuario || !usuario.activo) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    // Agregar información del usuario al request
    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      rol: usuario.rol,
      empresa_id: usuario.empresa_id,
      sucursal_id: usuario.sucursal_id
    };
    
    req.userId = usuario.id;
    req.userRole = usuario.rol;
    req.empresaId = usuario.empresa_id;
    req.sucursalId = usuario.sucursal_id;

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware para verificar roles específicos
export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.userRole || !roles.includes(req.userRole)) {
        throw new UnauthorizedError('No tienes permisos para realizar esta acción');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware para verificar que pertenece a la misma empresa
export const requireSameEmpresa = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const empresaId = req.params.empresaId || req.body.empresa_id;
    
    if (req.userRole === 'super_admin') {
      // Super admin puede acceder a cualquier empresa
      return next();
    }
    
    if (!empresaId || empresaId !== req.empresaId) {
      throw new UnauthorizedError('No tienes acceso a esta empresa');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};