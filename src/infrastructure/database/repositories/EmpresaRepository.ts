//Ruta: src/infrastructure/database/repositories/EmpresaRepository.ts

import { IEmpresaRepository, EmpresaFilters } from '@/domain/repositories/IEmpresaRepository';
import { Empresa } from '@/domain/entities/Empresa';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';
import { supabase } from '@/infrastructure/config/database';

export class EmpresaRepository implements IEmpresaRepository {
  async create(empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>): Promise<Empresa> {
    const { data, error } = await supabase
      .from('empresas')
      .insert({
        nombre: empresa.nombre,
        ruc: empresa.ruc,
        direccion: empresa.direccion,
        telefono: empresa.telefono,
        email: empresa.email,
        logo_url: empresa.logo_url,
        activo: empresa.activo
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating empresa: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding empresa: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByRuc(ruc: string): Promise<Empresa | null> {
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('ruc', ruc)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding empresa by RUC: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findAll(
    pagination: PaginationParams,
    filters?: EmpresaFilters
  ): Promise<PaginatedResponse<Empresa>> {
    let query = supabase
      .from('empresas')
      .select('*', { count: 'exact' })
      .eq('activo', true);

    // Aplicar filtros
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.ruc) {
      query = query.ilike('ruc', `%${filters.ruc}%`);
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
      throw new Error(`Error listing empresas: ${error.message}`);
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

  async update(id: string, data: Partial<Empresa>): Promise<Empresa> {
    const { data: updatedData, error } = await supabase
      .from('empresas')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating empresa: ${error.message}`);
    }

    return this.mapToEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('empresas')
      .update({ 
        activo: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting empresa: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('empresas')
      .select('id')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking empresa existence: ${error.message}`);
    }

    return !!data;
  }

  async count(filters?: EmpresaFilters): Promise<number> {
    let query = supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.ruc) {
      query = query.ilike('ruc', `%${filters.ruc}%`);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting empresas: ${error.message}`);
    }

    return count || 0;
  }

  private mapToEntity(data: any): Empresa {
    return {
      id: data.id,
      nombre: data.nombre,
      ruc: data.ruc,
      direccion: data.direccion,
      telefono: data.telefono,
      email: data.email,
      logo_url: data.logo_url,
      activo: data.activo,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}