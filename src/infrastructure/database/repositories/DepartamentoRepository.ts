// Ruta: src/infrastructure/database/repositories/DepartamentoRepository.ts

import { IDepartamentoRepository, DepartamentoFilters, DepartamentoJerarquia } from '../../../domain/repositories/IDepartamentoRepository';
import { Departamento } from '../../../domain/entities/Departamento';
import { PaginationParams, PaginatedResponse } from '../../../shared/types/common';
import { supabase } from '../../config/database';

export class DepartamentoRepository implements IDepartamentoRepository {
  async create(departamento: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>): Promise<Departamento> {
    // Calcular nivel antes de insertar
    const nivel = await this.calcularNivel(departamento.departamento_padre_id);
    
    const { data, error } = await supabase
      .from('departamentos')
      .insert({
        empresa_id: departamento.empresa_id,
        nombre: departamento.nombre,
        codigo: departamento.codigo,
        descripcion: departamento.descripcion,
        departamento_padre_id: departamento.departamento_padre_id,
        responsable_id: departamento.responsable_id,
        nivel: nivel,
        activo: departamento.activo
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating departamento: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Departamento | null> {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding departamento: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByCode(codigo: string, empresaId: string): Promise<Departamento | null> {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('codigo', codigo)
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding departamento by code: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<DepartamentoFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Departamento>> {
    return this.findAll(pagination, { ...filters, empresa_id: empresaId });
  }

  async findAll(
    pagination: PaginationParams,
    filters?: DepartamentoFilters
  ): Promise<PaginatedResponse<Departamento>> {
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('departamentos')
      .select('*')
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
    if (filters?.departamento_padre_id) {
      query = query.eq('departamento_padre_id', filters.departamento_padre_id);
    }
    if (filters?.responsable_id) {
      query = query.eq('responsable_id', filters.responsable_id);
    }
    if (filters?.nivel) {
      query = query.eq('nivel', filters.nivel);
    }
    if (filters?.activo !== undefined) {
      query = query.eq('activo', filters.activo);
    }

    // Obtener total de registros
    const countQuery = supabase
    .from('departamentos')
    .select('*', { count: 'exact', head: true })
    .eq('activo', true);

    // Aplicar los mismos filtros al conteo
    if (filters?.empresa_id) {
    countQuery.eq('empresa_id', filters.empresa_id);
    }
    if (filters?.nombre) {
    countQuery.ilike('nombre', `%${filters.nombre}%`);
    }
    if (filters?.codigo) {
    countQuery.ilike('codigo', `%${filters.codigo}%`);
    }
    if (filters?.departamento_padre_id) {
    countQuery.eq('departamento_padre_id', filters.departamento_padre_id);
    }
    if (filters?.responsable_id) {
    countQuery.eq('responsable_id', filters.responsable_id);
    }
    if (filters?.nivel) {
    countQuery.eq('nivel', filters.nivel);
    }
    if (filters?.activo !== undefined) {
    countQuery.eq('activo', filters.activo);
    }

    const { count } = await countQuery;

    // Aplicar paginación y ordenamiento
    const { data, error } = await query
      .order('nivel', { ascending: true })
      .order('nombre', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error finding departamentos: ${error.message}`);
    }

    const departamentos = data ? data.map(this.mapToEntity) : [];

    return {
      data: departamentos,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async update(id: string, data: Partial<Departamento>): Promise<Departamento> {
    // Si se está cambiando el padre, recalcular nivel
    let updateData = { ...data };
    if (data.departamento_padre_id !== undefined) {
      updateData.nivel = await this.calcularNivel(data.departamento_padre_id);
    }

    const { data: updatedData, error } = await supabase
      .from('departamentos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating departamento: ${error.message}`);
    }

    return this.mapToEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    // Soft delete
    const { error } = await supabase
      .from('departamentos')
      .update({ activo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting departamento: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('departamentos')
      .select('id')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking departamento existence: ${error.message}`);
    }

    return !!data;
  }

  async existsByCode(codigo: string, empresaId: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('departamentos')
      .select('id')
      .eq('codigo', codigo)
      .eq('empresa_id', empresaId)
      .eq('activo', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error checking departamento code existence: ${error.message}`);
    }

    return !!data;
  }

  async count(filters?: DepartamentoFilters): Promise<number> {
    let query = supabase
      .from('departamentos')
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
    if (filters?.departamento_padre_id) {
      query = query.eq('departamento_padre_id', filters.departamento_padre_id);
    }
    if (filters?.responsable_id) {
      query = query.eq('responsable_id', filters.responsable_id);
    }
    if (filters?.nivel) {
      query = query.eq('nivel', filters.nivel);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Error counting departamentos: ${error.message}`);
    }

    return count || 0;
  }

  async countByEmpresa(empresaId: string): Promise<number> {
    return this.count({ empresa_id: empresaId });
  }

  async findChildren(departamentoId: string): Promise<Departamento[]> {
    const { data, error } = await supabase
      .from('departamentos')
      .select('*')
      .eq('departamento_padre_id', departamentoId)
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(`Error finding children departamentos: ${error.message}`);
    }

    return data ? data.map(this.mapToEntity) : [];
  }

  async findJerarquia(empresaId?: string): Promise<DepartamentoJerarquia[]> {
    let query = supabase
      .from('mv_departamentos_jerarquia')
      .select('*');

    if (empresaId) {
      query = query.eq('empresa_id', empresaId);
    }

    const { data, error } = await query.order('ruta_codigos', { ascending: true });

    if (error) {
      throw new Error(`Error finding departamentos jerarquia: ${error.message}`);
    }

    return data || [];
  }

  async validateJerarquia(departamentoId: string, padreId?: string): Promise<boolean> {
    if (!padreId) return true; // Sin padre es válido
    if (departamentoId === padreId) return false; // No puede ser su propio padre

    // Verificar ciclos recorriendo hacia arriba
    let currentPadreId = padreId;
    let nivel = 0;
    const maxNiveles = 5;

    while (currentPadreId && nivel < maxNiveles) {
      if (currentPadreId === departamentoId) {
        return false; // Ciclo detectado
      }

      const { data, error } = await supabase
        .from('departamentos')
        .select('departamento_padre_id')
        .eq('id', currentPadreId)
        .eq('activo', true)
        .single();

      if (error) break;

      currentPadreId = data?.departamento_padre_id;
      nivel++;
    }

    return nivel < maxNiveles;
  }

  async calcularNivel(padreId?: string): Promise<number> {
    if (!padreId) return 1;

    const { data, error } = await supabase
      .from('departamentos')
      .select('nivel')
      .eq('id', padreId)
      .eq('activo', true)
      .single();

    if (error) return 1;

    return (data?.nivel || 0) + 1;
  }

  async obtenerRutaCompleta(departamentoId: string): Promise<string> {
    const { data, error } = await supabase
      .from('mv_departamentos_jerarquia')
      .select('ruta_completa')
      .eq('id', departamentoId)
      .single();

    if (error) {
      throw new Error(`Error obtaining departamento route: ${error.message}`);
    }

    return data?.ruta_completa || 'Departamento no encontrado';
  }

  private mapToEntity(data: any): Departamento {
    return {
      id: data.id,
      empresa_id: data.empresa_id,
      nombre: data.nombre,
      codigo: data.codigo,
      descripcion: data.descripcion,
      departamento_padre_id: data.departamento_padre_id,
      responsable_id: data.responsable_id,
      nivel: data.nivel,
      activo: data.activo,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}