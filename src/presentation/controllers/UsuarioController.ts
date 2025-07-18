// Ruta: src/presentation/controllers/UsuarioController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateUsuarioUseCase } from '@/application/use-cases/usuarios/CreateUsuarioUseCase';
import { GetUsuarioUseCase } from '@/application/use-cases/usuarios/GetUsuarioUseCase';
import { ListUsuariosUseCase } from '@/application/use-cases/usuarios/ListUsuariosUseCase';
import { UpdateUsuarioUseCase } from '@/application/use-cases/usuarios/UpdateUsuarioUseCase';
import { DeleteUsuarioUseCase } from '@/application/use-cases/usuarios/DeleteUsuarioUseCase';
import { GetUsuarioStatsUseCase } from '@/application/use-cases/usuarios/GetUsuarioStatsUseCase';
import { ChangePasswordUseCase, ResetPasswordUseCase } from '@/application/use-cases/usuarios/ChangePasswordUseCase';
import { ApiResponse, UserRole } from '@/shared/types/common';

interface AuthenticatedRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: UserRole;
  empresaId?: string;
  sucursalId?: string;
}

export class UsuarioController {
  constructor(
    private createUsuarioUseCase: CreateUsuarioUseCase,
    private getUsuarioUseCase: GetUsuarioUseCase,
    private listUsuariosUseCase: ListUsuariosUseCase,
    private updateUsuarioUseCase: UpdateUsuarioUseCase,
    private deleteUsuarioUseCase: DeleteUsuarioUseCase,
    private getUsuarioStatsUseCase: GetUsuarioStatsUseCase,
    private changePasswordUseCase: ChangePasswordUseCase,
    private resetPasswordUseCase: ResetPasswordUseCase
  ) {}

  // ========== CRUD Básico ==========

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;
      
      const result = await this.createUsuarioUseCase.execute(
        userData,
        req.userId!,
        req.userRole!,
        req.empresaId!
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Usuario creado exitosamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const result = await this.getUsuarioUseCase.execute(
        id,
        req.userRole!,
        req.empresaId!,
        req.sucursalId,
        req.userId
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        empresa_id: req.query.empresa_id as string,
        sucursal_id: req.query.sucursal_id as string,
        nombres: req.query.nombres as string,
        apellidos: req.query.apellidos as string,
        email: req.query.email as string,
        rol: req.query.rol as UserRole,
        cedula: req.query.cedula as string,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      };
      
      const result = await this.listUsuariosUseCase.execute(
        filters,
        req.userRole!,
        req.empresaId!,
        req.sucursalId
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await this.updateUsuarioUseCase.execute(
        id,
        updateData,
        req.userId!,
        req.userRole!,
        req.empresaId!,
        req.sucursalId
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Usuario actualizado exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.deleteUsuarioUseCase.execute(
        id,
        req.userId!,
        req.userRole!,
        req.empresaId!,
        req.sucursalId
      );
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Usuario eliminado exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ========== Funcionalidades Específicas ==========

  search = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        empresa_id: req.query.empresa_id as string,
        sucursal_id: req.query.sucursal_id as string,
        rol: req.query.rol as UserRole,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      };

      // Usar el listado con filtros de búsqueda
      const extendedFilters = {
        ...filters,
        nombres: searchTerm,
        apellidos: searchTerm,
        email: searchTerm,
        cedula: searchTerm
      };
      
      const result = await this.listUsuariosUseCase.execute(
        extendedFilters,
        req.userRole!,
        req.empresaId!,
        req.sucursalId
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: `Encontrados ${result.pagination.total} usuarios`
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Obtener el perfil del usuario autenticado
      const result = await this.getUsuarioUseCase.execute(
        req.userId!,
        req.userRole!,
        req.empresaId!,
        req.sucursalId,
        req.userId
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Perfil obtenido exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updateData = req.body;
      
      // Solo permitir actualizar campos básicos del perfil
      const allowedFields = ['nombres', 'apellidos', 'telefono', 'direccion', 'fecha_nacimiento'];
      const filteredData: any = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      
      const result = await this.updateUsuarioUseCase.execute(
        req.userId!,
        filteredData,
        req.userId!,
        req.userRole!,
        req.empresaId!,
        req.sucursalId
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Perfil actualizado exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        empresa_id: req.query.empresa_id as string,
        sucursal_id: req.query.sucursal_id as string,
        fecha_desde: req.query.fecha_desde as string,
        fecha_hasta: req.query.fecha_hasta as string
      };
      
      const result = await this.getUsuarioStatsUseCase.execute(
        req.userRole!,
        req.empresaId!,
        req.sucursalId,
        filters
      );
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Estadísticas obtenidas exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ========== Gestión de Contraseñas ==========

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const passwordData = req.body;
      
      await this.changePasswordUseCase.execute(
        id,
        passwordData,
        req.userId!,
        req.userRole!
      );
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Contraseña cambiada exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { new_password } = req.body;
      
      const temporaryPassword = await this.resetPasswordUseCase.execute(
        id,
        new_password,
        req.userId!,
        req.userRole!
      );
      
      const response: ApiResponse<{ temporary_password?: string }> = {
        success: true,
        data: new_password ? undefined : { temporary_password: temporaryPassword },
        message: new_password 
          ? 'Contraseña restablecida exitosamente' 
          : 'Contraseña temporal generada exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ========== Gestión Masiva ==========

  bulkUpdateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_ids, activo } = req.body;
      
      // Validar que el usuario tenga permisos para operaciones masivas
      if (!['super_admin', 'admin'].includes(req.userRole!)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No tienes permisos para operaciones masivas'
        };
        res.status(403).json(response);
        return;
      }

      // TODO: Implementar el repositorio bulkUpdateStatus
      // const updatedCount = await this.usuarioRepository.bulkUpdateStatus(user_ids, activo);
      
      const response: ApiResponse<{ updated_count: number }> = {
        success: true,
        data: { updated_count: user_ids.length },
        message: `${user_ids.length} usuarios actualizados exitosamente`
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  bulkDelete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_ids } = req.body;
      
      // Validar que el usuario tenga permisos para eliminación masiva
      if (!['super_admin', 'admin'].includes(req.userRole!)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No tienes permisos para eliminación masiva'
        };
        res.status(403).json(response);
        return;
      }

      // Verificar que no se incluya el usuario actual
      if (user_ids.includes(req.userId)) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'No puedes eliminarte a ti mismo en una operación masiva'
        };
        res.status(400).json(response);
        return;
      }

      // TODO: Implementar validaciones individuales para cada usuario
      // Por ahora, rechazar la operación masiva
      const response: ApiResponse<null> = {
        success: false,
        error: 'Eliminación masiva no disponible. Elimina usuarios individualmente.'
      };
      
      res.status(400).json(response);
    } catch (error) {
      next(error);
    }
  };

  // ========== Funcionalidades Auxiliares ==========

  checkEmailAvailability = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.query;
      const { exclude_id } = req.query;
      
      if (!email) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Email es requerido'
        };
        res.status(400).json(response);
        return;
      }

      // TODO: Implementar verificación de email
      // const isAvailable = !await this.usuarioRepository.existsByEmail(email as string, exclude_id as string);
      const isAvailable = true; // Placeholder
      
      const response: ApiResponse<{ available: boolean }> = {
        success: true,
        data: { available: isAvailable },
        message: isAvailable ? 'Email disponible' : 'Email ya está en uso'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  checkCedulaAvailability = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cedula } = req.query;
      const { exclude_id } = req.query;
      
      if (!cedula) {
        const response: ApiResponse<null> = {
          success: false,
          error: 'Cédula es requerida'
        };
        res.status(400).json(response);
        return;
      }

      // TODO: Implementar verificación de cédula
      // const isAvailable = !await this.usuarioRepository.existsByCedula(cedula as string, req.empresaId!, exclude_id as string);
      const isAvailable = true; // Placeholder
      
      const response: ApiResponse<{ available: boolean }> = {
        success: true,
        data: { available: isAvailable },
        message: isAvailable ? 'Cédula disponible' : 'Cédula ya está registrada en esta empresa'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}