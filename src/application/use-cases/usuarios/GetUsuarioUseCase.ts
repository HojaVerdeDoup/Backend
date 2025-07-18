// Ruta: src/application/use-cases/usuarios/GetUsuarioUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { UsuarioResponseDTO, getUserRoleDescription } from '@/application/dtos/UsuarioDTO';
import { UserRole } from '@/shared/types/common';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

export class GetUsuarioUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(
    id: string,
    requestedByRole: UserRole,
    requestedByEmpresaId: string,
    requestedBySucursalId?: string,
    requestedByUserId?: string
  ): Promise<UsuarioResponseDTO> {
    
    // ========== Validar UUID ==========
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError('ID debe ser un UUID válido', 'id');
    }

    // ========== Obtener Usuario con Relaciones ==========
    const usuario = await this.usuarioRepository.findWithRelations(id);
    
    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    // ========== Validar Permisos de Acceso ==========
    await this.validateAccessPermissions(
      usuario,
      requestedByRole,
      requestedByEmpresaId,
      requestedBySucursalId,
      requestedByUserId
    );

    // ========== Mapear Respuesta ==========
    return {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      empresa_nombre: usuario.empresa_nombre,
      sucursal_id: usuario.sucursal_id,
      sucursal_nombre: usuario.sucursal_nombre,
      sucursal_codigo: usuario.sucursal_codigo,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
      rol: usuario.rol,
      rol_descripcion: getUserRoleDescription(usuario.rol),
      telefono: this.formatTelefono(usuario.telefono),
      cedula: this.formatCedula(usuario.cedula),
      direccion: usuario.direccion,
      fecha_nacimiento: usuario.fecha_nacimiento?.toISOString().split('T')[0],
      activo: usuario.activo,
      ultimo_login: usuario.ultimo_login,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    };
  }

  private async validateAccessPermissions(
    usuario: any,
    requestedByRole: UserRole,
    requestedByEmpresaId: string,
    requestedBySucursalId?: string,
    requestedByUserId?: string
  ): Promise<void> {
    
    // El usuario siempre puede ver su propio perfil
    if (requestedByUserId === usuario.id) {
      return;
    }

    switch (requestedByRole) {
      case 'super_admin':
        // Super admin puede ver cualquier usuario
        return;

      case 'admin':
        // Admin solo puede ver usuarios de su empresa
        if (usuario.empresa_id !== requestedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para ver este usuario',
            'usuario_id'
          );
        }
        return;

      case 'manager':
        // Manager puede ver usuarios de su empresa
        if (usuario.empresa_id !== requestedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para ver este usuario',
            'usuario_id'
          );
        }
        
        // Puede ver todos los usuarios de la empresa, pero tiene restricciones para editar
        return;

      case 'supervisor':
        // Supervisor solo puede ver usuarios de su sucursal
        if (usuario.empresa_id !== requestedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para ver este usuario',
            'usuario_id'
          );
        }
        
        if (usuario.sucursal_id !== requestedBySucursalId) {
          throw new ValidationError(
            'Solo puedes ver usuarios de tu sucursal',
            'usuario_id'
          );
        }
        return;

      case 'viewer':
        // Viewer solo puede ver usuarios de su sucursal con roles iguales o inferiores
        if (usuario.empresa_id !== requestedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para ver este usuario',
            'usuario_id'
          );
        }
        
        if (usuario.sucursal_id !== requestedBySucursalId) {
          throw new ValidationError(
            'Solo puedes ver usuarios de tu sucursal',
            'usuario_id'
          );
        }
        
        // Solo puede ver viewer y supervisor
        if (!['viewer', 'supervisor'].includes(usuario.rol)) {
          throw new ValidationError(
            'No tienes permisos para ver este tipo de usuario',
            'usuario_id'
          );
        }
        return;

      default:
        throw new ValidationError('Rol no autorizado para esta operación', 'rol');
    }
  }

  private formatTelefono(telefono?: string): string | undefined {
    if (!telefono) return undefined;
    
    const cleanPhone = telefono.replace(/\D/g, '');
    
    // Formato para celular ecuatoriano: 099 123 4567
    if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
      return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    }
    
    // Formato para convencional: (02) 234 5678
    if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
    }
    
    return telefono;
  }

  private formatCedula(cedula?: string): string | undefined {
    if (!cedula) return undefined;
    
    // Formato: 1234567890 -> 123456789-0
    if (cedula.length === 10) {
      return `${cedula.substring(0, 9)}-${cedula.substring(9)}`;
    }
    
    return cedula;
  }
}