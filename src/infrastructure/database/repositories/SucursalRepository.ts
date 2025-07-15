//Ruta: src/infrastructure/database/repositories/SucursalRepository.ts

import { ISucursalRepository, SucursalFilters } from '@/domain/repositories/ISucursalRepository';
import { Sucursal } from '@/domain/entities/Sucursal';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { supabase } from '@/infrastructure/config/database';

export class SucursalRepository implements ISucursalRepository {
  async create(sucursal: Omit<Sucursal, 'id' | 'created_at' | 'updated_at'>): Promise<Sucursal> {
    const { data, error } = await supabase
      .from('sucursales')
      .insert({
        empresa_id: sucursal.empresa_id,
        nombre: sucursal.nombre,
        codigo: sucursal.codigo,
        direccion: sucursal.direccion,
        telefono: sucursal.telefono,
        ciudad: sucursal.ciudad,
        activo: sucursal.activo
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating sucursal: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Sucursal | null> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding sucursal: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCode(codigo: string, empresaId: string): Promise<Sucursal | null> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('*')
      .eq('codigo', codigo)
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding sucursal by code: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<SucursalFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Sucursal>> {
    let query = supabase
      .from('sucursales')
      .select('*', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    // Aplicar filtros
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
      query = query.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.ciudad) {
      query = query.ilike('ciudad', `%${filters.ciudad}%`);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    // Aplicar paginación
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error listing sucursales by empresa: ${error.message}`);
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

  async findAll(
    pagination: PaginationParams,
    filters?: SucursalFilters
  ): Promise<PaginatedResponse<Sucursal>> {
    let query = supabase
      .from('sucursales')
      .select('*', { count: 'exact' })
      .eq('activo', true);

    // Aplicar filtros
    if (filters?.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
      query = query.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.ciudad) {
      query = query.ilike('ciudad', `%${filters.ciudad}%`);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    // Aplicar paginación
    const from = (pagination.page - 1) * pagination.limit;
    const to = from + pagination.limit - 1;

    query = query
      .range(from, to)
      .order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error listing sucursales: ${error.message}`);
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

  async update(id: string, data: Partial<Sucursal>): Promise<Sucursal> {
    const { data: updatedData, error } = await supabase
      .from('sucursales')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating sucursal: ${error.message}`);
    }

    return this.mapToEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sucursales')
      .update({ 
        activo: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting sucursal: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('sucursales')
      .select('id')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking sucursal existence: ${error.message}`);
    }

    return !!data;
  }

  async existsByCode(codigo: string, empresaId: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('sucursales')
      .select('id')
      .eq('codigo', codigo)
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking sucursal code existence: ${error.message}`);
    }

    return !!data;
  }

  async count(filters?: SucursalFilters): Promise<number> {
    let query = supabase
      .from('sucursales')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    if (filters?.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
      query = query.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.ciudad) {
      query = query.ilike('ciudad', `%${filters.ciudad}%`);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting sucursales: ${error.message}`);
    }

    return count || 0;
  }

  async countByEmpresa(empresaId: string): Promise<number> {
    const { count, error } = await supabase
      .from('sucursales')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    if (error) {
      throw new Error(`Error counting sucursales by empresa: ${error.message}`);
    }

    return count || 0;
  }

  private mapToEntity(data: any): Sucursal {
    return {
      id: data.id,
      empresa_id: data.empresa_id,
      nombre: data.nombre,
      codigo: data.codigo,
      direccion: data.direccion,
      telefono: data.telefono,
      ciudad: data.ciudad,
      activo: data.activo,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}