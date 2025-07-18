// Ruta: src/application/use-cases/usuarios/DeleteUsuarioUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { UserRole } from '@/shared/types/common';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

export class DeleteUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(
    id: string,
    deletedByUserId: string,
    deletedByUserRole: UserRole,
    deletedByEmpresaId: string,
    deletedBySucursalId?: string
  ): Promise<void> {
    
    // ========== Validar que el usuario existe ==========
    const userToDelete = await this.usuarioRepository.findById(id);
    if (!userToDelete) {
      throw new NotFoundError('Usuario');
    }

    // ========== Validar que no se está auto-eliminando ==========
    if (deletedByUserId === id) {
      throw new ValidationError(
        'No puedes eliminar tu propia cuenta',
        'user_id'
      );
    }

    // ========== Validar permisos de eliminación ==========
    await this.validateDeletePermissions(
      userToDelete,
      deletedByUserRole,
      deletedByEmpresaId,
      deletedBySucursalId
    );

    // ========== Validar reglas de negocio para eliminación ==========
    await this.validateDeleteBusinessRules(userToDelete);

    // ========== Realizar soft delete ==========
    await this.usuarioRepository.delete(id);
  }

  private async validateDeletePermissions(
    userToDelete: any,
    deletedByUserRole: UserRole,
    deletedByEmpresaId: string,
    deletedBySucursalId?: string
  ): Promise<void> {
    
    switch (deletedByUserRole) {
      case 'super_admin':
        // Super admin puede eliminar cualquier usuario excepto otros super_admins
        if (userToDelete.rol === 'super_admin') {
          throw new ValidationError(
            'Los super administradores no pueden eliminarse entre sí',
            'rol'
          );
        }
        return;

      case 'admin':
        // Admin solo puede eliminar usuarios de su empresa
        if (userToDelete.empresa_id !== deletedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para eliminar usuarios de esta empresa',
            'empresa_id'
          );
        }
        
        // Admin no puede eliminar super_admins ni otros admins
        if (['super_admin', 'admin'].includes(userToDelete.rol)) {
          throw new ValidationError(
            'No tienes permisos para eliminar administradores',
            'rol'
          );
        }
        
        return;

      case 'manager':
        // Manager puede eliminar usuarios básicos de su empresa
        if (userToDelete.empresa_id !== deletedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para eliminar usuarios de esta empresa',
            'empresa_id'
          );
        }
        
        // Manager solo puede eliminar viewer y supervisor
        if (!['viewer', 'supervisor'].includes(userToDelete.rol)) {
          throw new ValidationError(
            'Solo puedes eliminar usuarios con rol Visualizador o Supervisor',
            'rol'
          );
        }
        
        return;

      case 'supervisor':
      case 'viewer':
        // Estos roles no pueden eliminar usuarios
        throw new ValidationError(
          'No tienes permisos para eliminar usuarios',
          'rol'
        );

      default:
        throw new ValidationError('Rol no autorizado para esta operación', 'rol');
    }
  }

  private async validateDeleteBusinessRules(userToDelete: any): Promise<void> {
    // Verificar que no es el último admin de la empresa
    if (userToDelete.rol === 'admin') {
      const adminCount = await this.usuarioRepository.countByRole('admin', userToDelete.empresa_id);
      if (adminCount <= 1) {
        throw new ValidationError(
          'No se puede eliminar el último administrador de la empresa',
          'rol'
        );
      }
    }

    // Verificar que no es el último super_admin del sistema
    if (userToDelete.rol === 'super_admin') {
      const superAdminCount = await this.usuarioRepository.countByRole('super_admin');
      if (superAdminCount <= 1) {
        throw new ValidationError(
          'No se puede eliminar el último super administrador del sistema',
          'rol'
        );
      }
    }

    // TODO: Verificar dependencias futuras
    // - Verificar que no tiene empleados asignados
    // - Verificar que no tiene asistencias registradas
    // - Verificar que no está asignado a reportes pendientes
    
    // Por ahora, permitir eliminación si pasa las validaciones básicas
  }
}