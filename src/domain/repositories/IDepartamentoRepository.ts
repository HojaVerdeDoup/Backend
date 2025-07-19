// Ruta: src/domain/repositories/IDepartamentoRepository.ts

import { Departamento } from '../entities/Departamento';
import { PaginationParams, PaginatedResponse } from '../../shared/types/common';

export interface DepartamentoFilters {
  empresa_id?: string;
  nombre?: string;
  codigo?: string;
  departamento_padre_id?: string;
  responsable_id?: string;
  nivel?: number;
  activo?: boolean;
}

export interface DepartamentoJerarquia {
  id: string;
  empresa_id: string;
  nombre: string;
  codigo: string;
  nivel: number;
  departamento_padre_id?: string;
  responsable_id?: string;
  ruta_completa: string;
  ruta_codigos: string;
  profundidad: number;
  empresa_nombre: string;
  responsable_nombre: string;
  subdepartamentos_count: number;
  areas_count: number;
  usuarios_count: number;
}

export interface IDepartamentoRepository {
  create(departamento: Omit<Departamento, 'id' | 'created_at' | 'updated_at'>): Promise<Departamento>;
  findById(id: string): Promise<Departamento | null>;
  findByCode(codigo: string, empresaId: string): Promise<Departamento | null>;
  findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<DepartamentoFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Departamento>>;
  findAll(
    pagination: PaginationParams,
    filters?: DepartamentoFilters
  ): Promise<PaginatedResponse<Departamento>>;
  update(id: string, data: Partial<Departamento>): Promise<Departamento>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByCode(codigo: string, empresaId: string, excludeId?: string): Promise<boolean>;
  count(filters?: DepartamentoFilters): Promise<number>;
  countByEmpresa(empresaId: string): Promise<number>;
  
  // Funciones específicas de jerarquía
  findChildren(departamentoId: string): Promise<Departamento[]>;
  findJerarquia(empresaId?: string): Promise<DepartamentoJerarquia[]>;
  validateJerarquia(departamentoId: string, padreId?: string): Promise<boolean>;
  calcularNivel(padreId?: string): Promise<number>;
  obtenerRutaCompleta(departamentoId: string): Promise<string>;
}