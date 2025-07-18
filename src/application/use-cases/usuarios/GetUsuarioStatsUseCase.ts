// Ruta: src/application/use-cases/usuarios/GetUsuarioStatsUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { UsuarioStatsDTO } from '@/application/dtos/UsuarioDTO';
import { UserRole } from '@/shared/types/common';
import { ValidationError } from '@/shared/errors/AppError';

export class GetUsuarioStatsUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(
    requestedByRole: UserRole,
    requestedByEmpresaId: string,
    requestedBySucursalId?: string,
    filters?: {
      empresa_id?: string;
      sucursal_id?: string;
      fecha_desde?: string;
      fecha_hasta?: string;
    }
  ): Promise<UsuarioStatsDTO> {
    
    // ========== Aplicar filtros de seguridad por rol ==========
    const secureFilters = this.applySecurityFilters(
      filters,
      requestedByRole,
      requestedByEmpresaId,
      requestedBySucursalId
    );

    // ========== Convertir fechas si se proporcionan ==========
    const statsFilters: any = { ...secureFilters };
    if (statsFilters.fecha_desde) {
      statsFilters.fecha_desde = new Date(statsFilters.fecha_desde);
    }
    if (statsFilters.fecha_hasta) {
      statsFilters.fecha_hasta = new Date(statsFilters.fecha_hasta);
    }

    // ========== Obtener estadísticas ==========
    const stats = await this.usuarioRepository.getStats(statsFilters);

    // ========== Mapear respuesta ==========
    return {
      total_usuarios: stats.total_usuarios,
      usuarios_activos: stats.usuarios_activos,
      usuarios_por_rol: stats.usuarios_por_rol.map(item => ({
        rol: item.rol,
        count: item.count
      })),
      usuarios_por_sucursal: stats.usuarios_por_sucursal.map(item => ({
        sucursal_nombre: item.sucursal_nombre,
        count: item.count
      })),
      ultimo_login_reciente: stats.ultimo_login_reciente
    };
  }

  private applySecurityFilters(
    filters: any,
    requestedByRole: UserRole,
    requestedByEmpresaId: string,
    requestedBySucursalId?: string
  ): any {
    const secureFilters: any = { ...filters };

    switch (requestedByRole) {
      case 'super_admin':
        // Super admin puede ver estadísticas de cualquier empresa/sucursal
        break;

      case 'admin':
        // Admin solo puede ver estadísticas de su empresa
        secureFilters.empresa_id = requestedByEmpresaId;
        break;

      case 'manager':
        // Manager puede ver estadísticas de su empresa, con preferencia a su sucursal
        secureFilters.empresa_id = requestedByEmpresaId;
        
        // Si no especifica sucursal, mostrar su sucursal por defecto
        if (!secureFilters.sucursal_id && requestedBySucursalId) {
          secureFilters.sucursal_id = requestedBySucursalId;
        }
        break;

      case 'supervisor':
        // Supervisor solo puede ver estadísticas de su sucursal
        secureFilters.empresa_id = requestedByEmpresaId;
        secureFilters.sucursal_id = requestedBySucursalId || '';
        break;

      case 'viewer':
        // Viewer solo puede ver estadísticas limitadas de su sucursal
        secureFilters.empresa_id = requestedByEmpresaId;
        if (requestedBySucursalId) {
          secureFilters.sucursal_id = requestedBySucursalId;
        }
        break;

      default:
        throw new ValidationError('Rol no autorizado para ver estadísticas', 'rol');
    }

    return secureFilters;
  }
}