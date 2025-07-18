// Ruta: src/infrastructure/database/repositories/UsuarioRepository.ts (ACTUALIZAR SOLO LOS IMPORTS)

import { IUsuarioRepository, UsuarioFilters, UsuarioStatsFilters, UsuarioStats } from '@/domain/repositories/IUsuarioRepository';
import { Usuario } from '@/domain/entities/Usuario';
import { PaginationParams, PaginatedResponse, UserRole } from '@/shared/types/common';
import { supabase } from '@/infrastructure/config/database';

export class UsuarioRepository implements IUsuarioRepository {
  
  // ========== Métodos CRUD Básicos ==========
  
  async create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        empresa_id: usuario.empresa_id,
        sucursal_id: usuario.sucursal_id,
        email: usuario.email,
        password_hash: usuario.password_hash,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        telefono: usuario.telefono,
        cedula: usuario.cedula,
        direccion: usuario.direccion,
        fecha_nacimiento: usuario.fecha_nacimiento?.toISOString().split('T')[0],
        activo: usuario.activo
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding user: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding user by email: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCedula(cedula: string, empresaId?: string): Promise<Usuario | null> {
    let query = supabase
      .from('usuarios')
      .select('*')
      .eq('cedula', cedula)
      .eq('activo', true);

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding user by cedula: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const updateData: any = { ...data };
    
    // Convertir fecha de nacimiento si existe
    if (updateData.fecha_nacimiento instanceof Date) {
      updateData.fecha_nacimiento = updateData.fecha_nacimiento.toISOString().split('T')[0];
    }
    
    updateData.updated_at = new Date().toISOString();

    const { data: updatedData, error } = await supabase
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return this.mapToEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        activo: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        ultimo_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  // ========== Métodos de Búsqueda Avanzada ==========

  async findAll(
    pagination: PaginationParams,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<Usuario>> {
    let query = supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .eq('activo', true);

    // Aplicar filtros
    query = this.applyFilters(query, filters);

    // Aplicar paginación
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error listing users: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data: data.map(item => this.mapToEntity(item)),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    };
  }

  async findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<UsuarioFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Usuario>> {
    return this.findAll(pagination, { ...filters, empresa_id: empresaId });
  }

  async findBySucursal(
    sucursalId: string,
    pagination: PaginationParams,
    filters?: Omit<UsuarioFilters, 'sucursal_id'>
  ): Promise<PaginatedResponse<Usuario>> {
    return this.findAll(pagination, { ...filters, sucursal_id: sucursalId });
  }

  async findByRole(
    rol: UserRole,
    pagination: PaginationParams,
    filters?: Omit<UsuarioFilters, 'rol'>
  ): Promise<PaginatedResponse<Usuario>> {
    return this.findAll(pagination, { ...filters, rol });
  }

  // ========== Métodos de Validación ==========

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking user existence: ${error.message}`);
    }

    return !!data;
  }

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .eq('activo', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking email existence: ${error.message}`);
    }

    return !!data;
  }

  async existsByCedula(cedula: string, empresaId: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('usuarios')
      .select('id')
      .eq('cedula', cedula)
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking cedula existence: ${error.message}`);
    }

    return !!data;
  }

  async isEmailUniqueInEmpresa(email: string, empresaId: string, excludeId?: string): Promise<boolean> {
    const exists = await this.existsByEmail(email, excludeId);
    return !exists;
  }

  async isCedulaUniqueInEmpresa(cedula: string, empresaId: string, excludeId?: string): Promise<boolean> {
    const exists = await this.existsByCedula(cedula, empresaId, excludeId);
    return !exists;
  }

  // ========== Métodos de Conteo ==========

  async count(filters?: UsuarioFilters): Promise<number> {
    let query = supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    query = this.applyFilters(query, filters);

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting users: ${error.message}`);
    }

    return count || 0;
  }

  async countByEmpresa(empresaId: string, filters?: Omit<UsuarioFilters, 'empresa_id'>): Promise<number> {
    return this.count({ ...filters, empresa_id: empresaId });
  }

  async countBySucursal(sucursalId: string, filters?: Omit<UsuarioFilters, 'sucursal_id'>): Promise<number> {
    return this.count({ ...filters, sucursal_id: sucursalId });
  }

  async countByRole(rol: UserRole, empresaId?: string): Promise<number> {
    return this.count({ rol, empresa_id: empresaId });
  }

  async countActiveUsers(empresaId?: string): Promise<number> {
    return this.count({ activo: true, empresa_id: empresaId });
  }

  // ========== Métodos de Estadísticas ==========

  async getStats(filters?: UsuarioStatsFilters): Promise<UsuarioStats> {
    // Total usuarios
    const totalUsers = await this.count({ empresa_id: filters?.empresa_id });
    
    // Usuarios activos
    const activeUsers = await this.countActiveUsers(filters?.empresa_id);

    // Usuarios por rol
    const rolesQuery = supabase
      .from('usuarios')
      .select('rol')
      .eq('activo', true);
    
    if (filters?.empresa_id) {
      rolesQuery.eq('empresa_id', filters.empresa_id);
    }

    const { data: rolesData } = await rolesQuery;
    const rolesCounts = (rolesData || []).reduce((acc: any, user: any) => {
      acc[user.rol] = (acc[user.rol] || 0) + 1;
      return acc;
    }, {});

    const usuariosPorRol = Object.entries(rolesCounts).map(([rol, count]) => ({
      rol: rol as UserRole,
      count: count as number
    }));

    // Usuarios por sucursal
    const sucursalesQuery = supabase
      .from('usuarios')
      .select(`
        sucursal_id,
        sucursales!inner(nombre)
      `)
      .eq('activo', true)
      .not('sucursal_id', 'is', null);

    if (filters?.empresa_id) {
      sucursalesQuery.eq('empresa_id', filters.empresa_id);
    }

    const { data: sucursalesData } = await sucursalesQuery;
    const sucursalesCounts = (sucursalesData || []).reduce((acc: any, user: any) => {
      const key = user.sucursal_id;
      if (!acc[key]) {
        acc[key] = {
          sucursal_id: user.sucursal_id,
          sucursal_nombre: user.sucursales.nombre,
          count: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {});

    // Últimos logins (24 horas)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let recentLoginsQuery = supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .gte('ultimo_login', yesterday.toISOString());

    if (filters?.empresa_id) {
      recentLoginsQuery = recentLoginsQuery.eq('empresa_id', filters.empresa_id);
    }

    const { count: recentLogins } = await recentLoginsQuery;

    return {
      total_usuarios: totalUsers,
      usuarios_activos: activeUsers,
      usuarios_por_rol: usuariosPorRol,
      usuarios_por_sucursal: Object.values(sucursalesCounts),
      ultimo_login_reciente: recentLogins || 0
    };
  }

  async getRecentLogins(days: number, empresaId?: string): Promise<Usuario[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    let query = supabase
      .from('usuarios')
      .select('*')
      .eq('activo', true)
      .gte('ultimo_login', dateFrom.toISOString())
      .order('ultimo_login', { ascending: false });

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error getting recent logins: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  async getUsersWithoutLogin(days: number, empresaId?: string): Promise<Usuario[]> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    let query = supabase
      .from('usuarios')
      .select('*')
      .eq('activo', true)
      .or(`ultimo_login.is.null,ultimo_login.lt.${dateFrom.toISOString()}`)
      .order('created_at', { ascending: false });

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error getting users without login: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  // ========== Métodos de Búsqueda Específica ==========

  async searchUsers(
    searchTerm: string,
    pagination: PaginationParams,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<Usuario>> {
    let query = supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .eq('activo', true);

    // Búsqueda por término
    query = query.or(`nombres.ilike.%${searchTerm}%,apellidos.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cedula.ilike.%${searchTerm}%`);

    // Aplicar filtros adicionales
    query = this.applyFilters(query, filters);

    // Aplicar paginación
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    query = query
      .range(from, to)
      .order('nombres', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error searching users: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data: data.map(item => this.mapToEntity(item)),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    };
  }

  async findAdminsByEmpresa(empresaId: string): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .in('rol', ['super_admin', 'admin'])
      .eq('activo', true)
      .order('nombres', { ascending: true });

    if (error) {
      throw new Error(`Error finding admins by empresa: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  async findManagersBySucursal(sucursalId: string): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('sucursal_id', sucursalId)
      .in('rol', ['manager', 'supervisor'])
      .eq('activo', true)
      .order('nombres', { ascending: true });

    if (error) {
      throw new Error(`Error finding managers by sucursal: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  async findUsersWithoutSucursal(empresaId: string): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .is('sucursal_id', null)
      .eq('activo', true)
      .order('nombres', { ascending: true });

    if (error) {
      throw new Error(`Error finding users without sucursal: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  // ========== Métodos de Gestión Masiva ==========

  async bulkUpdateStatus(userIds: string[], activo: boolean): Promise<number> {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        activo,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select('id');

    if (error) {
      throw new Error(`Error bulk updating user status: ${error.message}`);
    }

    return data.length;
  }

  async bulkUpdateSucursal(userIds: string[], sucursalId: string | null): Promise<number> {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        sucursal_id: sucursalId,
        updated_at: new Date().toISOString()
      })
      .in('id', userIds)
      .select('id');

    if (error) {
      throw new Error(`Error bulk updating user sucursal: ${error.message}`);
    }

    return data.length;
  }

  async bulkDelete(userIds: string[]): Promise<number> {
    return this.bulkUpdateStatus(userIds, false);
  }

  // ========== Métodos de Auditoría ==========

  async getLoginHistory(userId: string, limit: number = 10): Promise<{
    fecha: Date;
    ip_address?: string;
    user_agent?: string;
  }[]> {
    // Nota: Esta funcionalidad requiere una tabla de auditoría separada
    // Por ahora retornamos el último login del usuario
    const user = await this.findById(userId);
    if (!user || !user.ultimo_login) {
      return [];
    }

    return [{
      fecha: user.ultimo_login,
      ip_address: undefined,
      user_agent: undefined
    }];
  }

  async trackPasswordChange(userId: string): Promise<void> {
    // Nota: Esta funcionalidad requiere una tabla de auditoría separada
    // Por ahora solo actualizamos el timestamp del usuario
    await this.update(userId, { updated_at: new Date() });
  }

  async getPasswordChangeHistory(userId: string): Promise<Date[]> {
    // Nota: Esta funcionalidad requiere una tabla de auditoría separada
    // Por ahora retornamos solo la fecha de actualización del usuario
    const user = await this.findById(userId);
    if (!user) {
      return [];
    }

    return [user.updated_at];
  }

  // ========== Métodos Auxiliares ==========

  async findWithRelations(id: string): Promise<Usuario & {
    empresa_nombre?: string;
    sucursal_nombre?: string;
    sucursal_codigo?: string;
  } | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select(`
        *,
        empresas!inner(nombre),
        sucursales(nombre, codigo)
      `)
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding user with relations: ${error.message}`);
    }

    const user = this.mapToEntity(data);
    return {
      ...user,
      empresa_nombre: data.empresas.nombre,
      sucursal_nombre: data.sucursales?.nombre,
      sucursal_codigo: data.sucursales?.codigo
    };
  }

  async findAllWithRelations(
    pagination: PaginationParams,
    filters?: UsuarioFilters
  ): Promise<PaginatedResponse<Usuario & {
    empresa_nombre: string;
    sucursal_nombre?: string;
    sucursal_codigo?: string;
  }>> {
    let query = supabase
      .from('usuarios')
      .select(`
        *,
        empresas!inner(nombre),
        sucursales(nombre, codigo)
      `, { count: 'exact' })
      .eq('activo', true);

    // Aplicar filtros (adaptados para las relaciones)
    if (filters?.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.sucursal_id) {
      query = query.eq('sucursal_id', filters.sucursal_id);
    }
    if (filters?.nombres) {
      query = query.ilike('nombres', `%${filters.nombres}%`);
    }
    if (filters?.apellidos) {
      query = query.ilike('apellidos', `%${filters.apellidos}%`);
    }
    if (filters?.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters?.rol) {
      query = query.eq('rol', filters.rol);
    }
    if (filters?.cedula) {
      query = query.ilike('cedula', `%${filters.cedula}%`);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    // Aplicar paginación
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    query = query
      .range(from, to)
      .order('nombres', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error finding users with relations: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    const mappedData = data.map(item => {
      const user = this.mapToEntity(item);
      return {
        ...user,
        empresa_nombre: item.empresas.nombre,
        sucursal_nombre: item.sucursales?.nombre,
        sucursal_codigo: item.sucursales?.codigo
      };
    });

    return {
      data: mappedData,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages
      }
    };
  }

  // ========== Métodos Privados ==========

  private applyFilters(query: any, filters?: UsuarioFilters): any {
    if (!filters) return query;

    if (filters.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters.sucursal_id) {
      query = query.eq('sucursal_id', filters.sucursal_id);
    }
    if (filters.nombres) {
      query = query.ilike('nombres', `%${filters.nombres}%`);
    }
    if (filters.apellidos) {
      query = query.ilike('apellidos', `%${filters.apellidos}%`);
    }
    if (filters.email) {
      query = query.ilike('email', `%${filters.email}%`);
    }
    if (filters.rol) {
      query = query.eq('rol', filters.rol);
    }
    if (filters.cedula) {
      query = query.ilike('cedula', `%${filters.cedula}%`);
    }
    if (filters.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    return query;
  }

  private mapToEntity(data: any): Usuario {
    return {
      id: data.id,
      empresa_id: data.empresa_id,
      sucursal_id: data.sucursal_id,
      email: data.email,
      password_hash: data.password_hash,
      nombres: data.nombres,
      apellidos: data.apellidos,
      rol: data.rol,
      telefono: data.telefono,
      cedula: data.cedula,
      direccion: data.direccion,
      fecha_nacimiento: data.fecha_nacimiento ? new Date(data.fecha_nacimiento) : undefined,
      activo: data.activo,
      ultimo_login: data.ultimo_login ? new Date(data.ultimo_login) : undefined,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}