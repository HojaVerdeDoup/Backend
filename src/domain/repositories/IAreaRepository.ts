// Ruta: src/domain/repositories/IAreaRepository.ts

import { Area } from '../entities/Area';
import { PaginationParams, PaginatedResponse } from '../../shared/types/common';

export interface AreaFilters {
  empresa_id?: string;
  sucursal_id?: string;
  departamento_id?: string;
  nombre?: string;
  codigo?: string;
  responsable_id?: string;
  activo?: boolean;
}

export interface AreaEstadisticas {
  id: string;
  empresa_id: string;
  sucursal_id: string;
  departamento_id: string;
  nombre: string;
  codigo: string;
  empresa_nombre: string;
  sucursal_nombre: string;
  sucursal_codigo: string;
  departamento_nombre: string;
  departamento_codigo: string;
  responsable_nombre: string;
  horario_entrada: string;
  horario_salida: string;
  capacidad_maxima?: number;
  usuarios_count: number;
  created_at: Date;
  activo: boolean;
}

export interface IAreaRepository {
  create(area: Omit<Area, 'id' | 'created_at' | 'updated_at'>): Promise<Area>;
  findById(id: string): Promise<Area | null>;
  findByCode(codigo: string, sucursalId: string): Promise<Area | null>;
  findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<AreaFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Area>>;
  findBySucursal(
    sucursalId: string,
    pagination: PaginationParams,
    filters?: Omit<AreaFilters, 'sucursal_id'>
  ): Promise<PaginatedResponse<Area>>;
  findByDepartamento(
    departamentoId: string,
    pagination: PaginationParams,
    filters?: Omit<AreaFilters, 'departamento_id'>
  ): Promise<PaginatedResponse<Area>>;
  findAll(
    pagination: PaginationParams,
    filters?: AreaFilters
  ): Promise<PaginatedResponse<Area>>;
  update(id: string, data: Partial<Area>): Promise<Area>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByCode(codigo: string, sucursalId: string, excludeId?: string): Promise<boolean>;
  count(filters?: AreaFilters): Promise<number>;
  countByEmpresa(empresaId: string): Promise<number>;
  countBySucursal(sucursalId: string): Promise<number>;
  countByDepartamento(departamentoId: string): Promise<number>;
  
  // Funciones específicas de validación
  validateEmpresaConsistency(empresaId: string, sucursalId: string, departamentoId: string): Promise<boolean>;
  getEstadisticas(filters?: AreaFilters): Promise<AreaEstadisticas[]>;
}