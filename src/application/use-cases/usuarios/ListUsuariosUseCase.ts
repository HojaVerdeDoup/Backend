// Ruta: src/application/use-cases/usuarios/ListUsuariosUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { UsuarioFiltersDTO, UsuarioListDTO, getUserRoleDescription } from '@/application/dtos/UsuarioDTO';
import { PaginatedResponse, UserRole } from '@/shared/types/common';
import { ValidationError } from '@/shared/errors/AppError';

export class ListUsuariosUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(
    filters: UsuarioFiltersDTO,
    requestedByRole: UserRole,
    requestedByEmpresaId: string,
    requestedBySucursalId?: string
  ): Promise<PaginatedResponse<UsuarioListDTO>> {
    
    // ========== Validar Parámetros de Entrada ==========
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Máximo 100 por página

    if (page < 1) {
      throw new ValidationError('La página debe ser mayor a 0', 'page');
    }
    if (limit < 1) {
      throw new ValidationError('El límite debe ser mayor a 0', 'limit');
    }

    // ========== Aplicar Filtros de Seguridad por Rol ==========
    const secureFilters = await this.applySecurityFilters(
      filters,
      requestedByRole,
      requestedByEmpresaId,
      requestedBySucursalId
    );

    // ========== Obtener Usuarios con Relaciones ==========
    const result = await this.usuarioRepository.findAllWithRelations(
      { page, limit },
      secureFilters
    );

    // ========== Mapear Respuesta ==========
    const mappedData = result.data.map(usuario => ({
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
      activo: usuario.activo,
      ultimo_login: usuario.ultimo_login,
      created_at: usuario.created_at
    }));

    return {
      data: mappedData,
      pagination: result.pagination
    };
  }

  private async applySecurityFilters(
    filters: UsuarioFiltersDTO,
    requestedByRole: UserRole,
    requestedByEmpresaId: string,
    requestedBySucursalId?: string
  ): Promise<UsuarioFiltersDTO> {
    const secureFilters: UsuarioFiltersDTO = { ...filters };

    switch (requestedByRole) {
      case 'super_admin':
        // Super admin puede ver todos los usuarios sin restricciones
        break;

      case 'admin':
        // Admin solo puede ver usuarios de su empresa
        secureFilters.empresa_id = requestedByEmpresaId;
        break;

      case 'manager':
        // Manager puede ver usuarios de su empresa, pero con preferencia a su sucursal
        secureFilters.empresa_id = requestedByEmpresaId;
        
        // Si no especifica sucursal, mostrar su sucursal por defecto
        if (!secureFilters.sucursal_id && requestedBySucursalId) {
          secureFilters.sucursal_id = requestedBySucursalId;
        }
        break;

      case 'supervisor':
        // Supervisor solo puede ver usuarios de su sucursal
        secureFilters.empresa_id = requestedByEmpresaId;
        secureFilters.sucursal_id = requestedBySucursalId || '';
        break;

      case 'viewer':
        // Viewer solo puede ver usuarios de su sucursal y con roles iguales o inferiores
        secureFilters.empresa_id = requestedByEmpresaId;
        if (requestedBySucursalId) {
          secureFilters.sucursal_id = requestedBySucursalId;
        }
        // Limitar roles visibles
        if (!secureFilters.rol) {
          // Solo puede ver viewer y supervisor
          secureFilters.rol = 'viewer'; // Por defecto solo viewers
        } else if (!['viewer', 'supervisor'].includes(secureFilters.rol)) {
          // Si solicita ver otros roles, forzar a viewer
          secureFilters.rol = 'viewer';
        }
        break;

      default:
        throw new ValidationError('Rol no autorizado para esta operación', 'rol');
    }

    return secureFilters;
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
}