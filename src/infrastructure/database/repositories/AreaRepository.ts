// Ruta: src/infrastructure/database/repositories/AreaRepository.ts

import { IAreaRepository, AreaFilters, AreaEstadisticas } from '../../../domain/repositories/IAreaRepository';
import { Area, DiaLaborable } from '../../../domain/entities/Area';
import { PaginationParams, PaginatedResponse } from '../../../shared/types/common';
import { supabase } from '../../config/database';

export class AreaRepository implements IAreaRepository {
  async create(area: Omit<Area, 'id' | 'created_at' | 'updated_at'>): Promise<Area> {
    const { data, error } = await supabase
      .from('areas')
      .insert({
        empresa_id: area.empresa_id,
        sucursal_id: area.sucursal_id,
        departamento_id: area.departamento_id,
        nombre: area.nombre,
        codigo: area.codigo,
        descripcion: area.descripcion,
        responsable_id: area.responsable_id,
        horario_entrada: area.horario_entrada,
        horario_salida: area.horario_salida,
        tolerancia_entrada: area.tolerancia_entrada,
        tolerancia_salida: area.tolerancia_salida,
        dias_laborables: area.dias_laborables,
        ubicacion_fisica: area.ubicacion_fisica,
        capacidad_maxima: area.capacidad_maxima,
        activo: area.activo
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating area: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Area | null> {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding area: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCode(codigo: string, sucursalId: string): Promise<Area | null> {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('codigo', codigo)
      .eq('sucursal_id', sucursalId)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding area by code: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<AreaFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Area>> {
    return this.findAll(pagination, { ...filters, empresa_id: empresaId });
  }

  async findBySucursal(
    sucursalId: string,
    pagination: PaginationParams,
    filters?: Omit<AreaFilters, 'sucursal_id'>
  ): Promise<PaginatedResponse<Area>> {
    return this.findAll(pagination, { ...filters, sucursal_id: sucursalId });
  }

  async findByDepartamento(
    departamentoId: string,
    pagination: PaginationParams,
    filters?: Omit<AreaFilters, 'departamento_id'>
  ): Promise<PaginatedResponse<Area>> {
    return this.findAll(pagination, { ...filters, departamento_id: departamentoId });
  }

  async findAll(
    pagination: PaginationParams,
    filters?: AreaFilters
  ): Promise<PaginatedResponse<Area>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('areas')
      .select('*')
      .eq('activo', true);

    // Aplicar filtros
    if (filters?.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.sucursal_id) {
      query = query.eq('sucursal_id', filters.sucursal_id);
    }
    if (filters?.departamento_id) {
      query = query.eq('departamento_id', filters.departamento_id);
    }
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
      query = query.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.responsable_id) {
      query = query.eq('responsable_id', filters.responsable_id);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    // Obtener total de registros
    const countQuery = supabase
    .from('areas')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true);

    // Aplicar los mismos filtros al conteo
    if (filters?.empresa_id) {
    countQuery.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.sucursal_id) {
    countQuery.eq('sucursal_id', filters.sucursal_id);
    }
    if (filters?.departamento_id) {
    countQuery.eq('departamento_id', filters.departamento_id);
    }
    if (filters?.nombre) {
    countQuery.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
    countQuery.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.responsable_id) {
    countQuery.eq('responsable_id', filters.responsable_id);
    }
    if (filters?.activo !== undefined) {
    countQuery.eq('activo', filters.activo);
    }

    const { count } = await countQuery;

    // Aplicar paginación y ordenamiento
    const { data, error } = await query
      .order('nombre', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error finding areas: ${error.message}`);
    }

    const areas = data ? data.map(this.mapToEntity) : [];

    return {
      data: areas,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async update(id: string, data: Partial<Area>): Promise<Area> {
    const { data: updatedData, error } = await supabase
      .from('areas')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating area: ${error.message}`);
    }

    return this.mapToEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    const { error } = await supabase
      .from('areas')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting area: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('areas')
      .select('id')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking area existence: ${error.message}`);
    }

    return !!data;
  }

  async existsByCode(codigo: string, sucursalId: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('areas')
      .select('id')
      .eq('codigo', codigo)
      .eq('sucursal_id', sucursalId)
      .eq('activo', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking area code existence: ${error.message}`);
    }

    return !!data;
  }

  async count(filters?: AreaFilters): Promise<number> {
    let query = supabase
      .from('areas')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true);

    if (filters?.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.sucursal_id) {
      query = query.eq('sucursal_id', filters.sucursal_id);
    }
    if (filters?.departamento_id) {
      query = query.eq('departamento_id', filters.departamento_id);
    }
    if (filters?.nombre) {
      query = query.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
      query = query.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.responsable_id) {
      query = query.eq('responsable_id', filters.responsable_id);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting areas: ${error.message}`);
    }

    return count || 0;
  }

  async countByEmpresa(empresaId: string): Promise<number> {
    return this.count({ empresa_id: empresaId });
  }

  async countBySucursal(sucursalId: string): Promise<number> {
    return this.count({ sucursal_id: sucursalId });
  }

  async countByDepartamento(departamentoId: string): Promise<number> {
    return this.count({ departamento_id: departamentoId });
  }

  async validateEmpresaConsistency(
    empresaId: string,
    sucursalId: string,
    departamentoId: string
  ): Promise<boolean> {
    // Verificar que la sucursal pertenece a la empresa
    const { data: sucursal, error: sucursalError } = await supabase
      .from('sucursales')
      .select('empresa_id')
      .eq('id', sucursalId)
      .eq('activo', true)
      .single();

    if (sucursalError || !sucursal || sucursal.empresa_id !== empresaId) {
      return false;
    }

    // Verificar que el departamento pertenece a la empresa
    const { data: departamento, error: departamentoError } = await supabase
      .from('departamentos')
      .select('empresa_id')
      .eq('id', departamentoId)
      .eq('activo', true)
      .single();

    if (departamentoError || !departamento || departamento.empresa_id !== empresaId) {
      return false;
    }

    return true;
  }

  async getEstadisticas(filters?: AreaFilters): Promise<AreaEstadisticas[]> {
    let query = supabase
      .from('mv_areas_estadisticas')
      .select('*');

    if (filters?.empresa_id) {
      query = query.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.sucursal_id) {
      query = query.eq('sucursal_id', filters.sucursal_id);
    }
    if (filters?.departamento_id) {
      query = query.eq('departamento_id', filters.departamento_id);
    }

    const { data, error } = await query.order('empresa_nombre', { ascending: true });

    if (error) {
      throw new Error(`Error getting areas estadisticas: ${error.message}`);
    }

    return data || [];
  }

  private mapToEntity(data: any): Area {
    return {
      id: data.id,
      empresa_id: data.empresa_id,
      sucursal_id: data.sucursal_id,
      departamento_id: data.departamento_id,
      nombre: data.nombre,
      codigo: data.codigo,
      descripcion: data.descripcion,
      responsable_id: data.responsable_id,
      horario_entrada: data.horario_entrada,
      horario_salida: data.horario_salida,
      tolerancia_entrada: data.tolerancia_entrada,
      tolerancia_salida: data.tolerancia_salida,
      dias_laborables: data.dias_laborables as DiaLaborable,
      ubicacion_fisica: data.ubicacion_fisica,
      capacidad_maxima: data.capacidad_maxima,
      activo: data.activo,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}