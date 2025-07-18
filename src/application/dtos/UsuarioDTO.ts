// Ruta: src/application/dtos/UsuarioDTO.ts (ACTUALIZAR ARCHIVO EXISTENTE)

import { UserRole } from '@/shared/types/common';

// ========== DTOs para Creación ==========
export interface CreateUsuarioDTO {
  empresa_id: string;
  sucursal_id?: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  telefono?: string;
  cedula?: string;
  direccion?: string;
  fecha_nacimiento?: string;
}

// ========== DTOs para Actualización ==========
export interface UpdateUsuarioDTO {
  nombres?: string;
  apellidos?: string;
  email?: string;
  rol?: UserRole;
  sucursal_id?: string | null; // Permitir null para limpiar asignación
  telefono?: string | null;
  cedula?: string | null;
  direccion?: string | null;
  fecha_nacimiento?: string | null;
  activo?: boolean;
}

// ========== DTOs para Cambio de Contraseña ==========
export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordDTO {
  new_password: string;
  confirm_password: string;
}

// ========== DTOs de Autenticación (ya existentes) ==========
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

// ========== DTOs de Respuesta ==========
export interface UsuarioResponseDTO {
  id: string;
  empresa_id: string;
  empresa_nombre?: string;
  sucursal_id?: string;
  sucursal_nombre?: string;
  sucursal_codigo?: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  rol: UserRole;
  rol_descripcion: string;
  telefono?: string;
  cedula?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UsuarioListDTO {
  id: string;
  empresa_id: string;
  empresa_nombre: string;
  sucursal_id?: string;
  sucursal_nombre?: string;
  sucursal_codigo?: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  rol: UserRole;
  rol_descripcion: string;
  telefono?: string;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
}

export interface UsuarioProfileDTO {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  rol: UserRole;
  empresa_nombre: string;
  sucursal_nombre?: string;
  telefono?: string;
  direccion?: string;
  fecha_nacimiento?: string;
  ultimo_login?: Date;
  permisos: string[];
}

// ========== DTOs de Filtros ==========
export interface UsuarioFiltersDTO {
  empresa_id?: string;
  sucursal_id?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  rol?: UserRole;
  activo?: boolean;
  cedula?: string;
  page?: number;
  limit?: number;
}

// ========== DTOs de Autenticación Ampliados ==========
export interface AuthResponseDTO {
  user: UsuarioProfileDTO;
  token: string;
  refreshToken: string;
  expiresIn: string;
  permisos: string[];
}

// ========== DTOs de Estadísticas ==========
export interface UsuarioStatsDTO {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_por_rol: {
    rol: UserRole;
    count: number;
  }[];
  usuarios_por_sucursal: {
    sucursal_nombre: string;
    count: number;
  }[];
  ultimo_login_reciente: number; // Últimas 24 horas
}

// ========== Helpers de Transformación ==========
export const getUserRoleDescription = (rol: UserRole): string => {
  const descriptions = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    manager: 'Gerente',
    supervisor: 'Supervisor',
    viewer: 'Visualizador'
  };
  return descriptions[rol] || rol;
};

export const getUserPermissions = (rol: UserRole): string[] => {
  const permissions = {
    super_admin: [
      'create_empresa', 'edit_empresa', 'delete_empresa', 'view_empresa',
      'create_sucursal', 'edit_sucursal', 'delete_sucursal', 'view_sucursal',
      'create_usuario', 'edit_usuario', 'delete_usuario', 'view_usuario',
      'manage_all_data', 'view_all_reports', 'export_data', 'import_data'
    ],
    admin: [
      'edit_empresa', 'view_empresa',
      'create_sucursal', 'edit_sucursal', 'delete_sucursal', 'view_sucursal',
      'create_usuario', 'edit_usuario', 'delete_usuario', 'view_usuario',
      'manage_company_data', 'view_company_reports', 'export_company_data', 'import_company_data'
    ],
    manager: [
      'view_empresa', 'view_sucursal',
      'create_usuario', 'edit_usuario', 'view_usuario',
      'manage_branch_data', 'view_branch_reports', 'export_branch_data'
    ],
    supervisor: [
      'view_sucursal', 'view_usuario',
      'view_area_data', 'view_area_reports'
    ],
    viewer: [
      'view_sucursal', 'view_usuario',
      'view_assigned_data'
    ]
  };
  return permissions[rol] || [];
};