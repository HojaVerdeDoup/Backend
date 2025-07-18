// Ruta: src/domain/repositories/IUsuarioRepository.ts (REEMPLAZAR ARCHIVO COMPLETO)

import { Usuario } from '@/domain/entities/Usuario';
import { PaginationParams, PaginatedResponse, UserRole } from '@/shared/types/common';

export interface UsuarioFilters {
  empresa_id?: string;
  sucursal_id?: string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  rol?: UserRole;
  activo?: boolean;
  cedula?: string;
}

export interface UsuarioStatsFilters {
  empresa_id?: string;
  sucursal_id?: string;
  fecha_desde?: Date;
  fecha_hasta?: Date;
}

export interface UsuarioStats {
  total_usuarios: number;
  usuarios_activos: number;
  usuarios_por_rol: {
    rol: UserRole;
    count: number;
  }[];
  usuarios_por_sucursal: {
    sucursal_id: string;
    sucursal_nombre: string;
    count: number;
  }[];
  ultimo_login_reciente: number; // Últimas 24 horas
}

export interface IUsuarioRepository {
  // ========== Métodos CRUD Básicos ==========
  create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByCedula(cedula: string, empresaId?: string): Promise<Usuario | null>;
  update(id: string, data: Partial<Usuario>): Promise<Usuario>;
  delete(id: string): Promise<void>; // Soft delete
  updateLastLogin(id: string): Promise<void>;

  // ========== Métodos de Búsqueda Avanzada ==========
  findAll(
    pagination: PaginationParams,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<Usuario>>;
  
  findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<UsuarioFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Usuario>>;
  
  findBySucursal(
    sucursalId: string,
    pagination: PaginationParams,
    filters?: Omit<UsuarioFilters, 'sucursal_id'>
  ): Promise<PaginatedResponse<Usuario>>;
  
  findByRole(
    rol: UserRole,
    pagination: PaginationParams,
    filters?: Omit<UsuarioFilters, 'rol'>
  ): Promise<PaginatedResponse<Usuario>>;

  // ========== Métodos de Validación ==========
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string, excludeId?: string): Promise<boolean>;
  existsByCedula(cedula: string, empresaId: string, excludeId?: string): Promise<boolean>;
  isEmailUniqueInEmpresa(email: string, empresaId: string, excludeId?: string): Promise<boolean>;
  isCedulaUniqueInEmpresa(cedula: string, empresaId: string, excludeId?: string): Promise<boolean>;

  // ========== Métodos de Conteo ==========
  count(filters?: UsuarioFilters): Promise<number>;
  countByEmpresa(empresaId: string, filters?: Omit<UsuarioFilters, 'empresa_id'>): Promise<number>;
  countBySucursal(sucursalId: string, filters?: Omit<UsuarioFilters, 'sucursal_id'>): Promise<number>;
  countByRole(rol: UserRole, empresaId?: string): Promise<number>;
  countActiveUsers(empresaId?: string): Promise<number>;

  // ========== Métodos de Estadísticas ==========
  getStats(filters?: UsuarioStatsFilters): Promise<UsuarioStats>;
  getRecentLogins(days: number, empresaId?: string): Promise<Usuario[]>;
  getUsersWithoutLogin(days: number, empresaId?: string): Promise<Usuario[]>;

  // ========== Métodos de Búsqueda Específica ==========
  searchUsers(
    searchTerm: string,
    pagination: PaginationParams,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<Usuario>>;
  
  findAdminsByEmpresa(empresaId: string): Promise<Usuario[]>;
  findManagersBySucursal(sucursalId: string): Promise<Usuario[]>;
  findUsersWithoutSucursal(empresaId: string): Promise<Usuario[]>;

  // ========== Métodos de Gestión Masiva ==========
  bulkUpdateStatus(userIds: string[], activo: boolean): Promise<number>;
  bulkUpdateSucursal(userIds: string[], sucursalId: string | null): Promise<number>;
  bulkDelete(userIds: string[]): Promise<number>;

  // ========== Métodos de Auditoría ==========
  getLoginHistory(userId: string, limit?: number): Promise<{
    fecha: Date;
    ip_address?: string;
    user_agent?: string;
  }[]>;
  
  trackPasswordChange(userId: string): Promise<void>;
  getPasswordChangeHistory(userId: string): Promise<Date[]>;

  // ========== Métodos Auxiliares ==========
  findWithRelations(id: string): Promise<Usuario & {
    empresa_nombre?: string;
    sucursal_nombre?: string;
    sucursal_codigo?: string;
  } | null>;
  
  findAllWithRelations(
    pagination: PaginationParams,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<Usuario & {
    empresa_nombre: string;
    sucursal_nombre?: string;
    sucursal_codigo?: string;
  }>>;
}