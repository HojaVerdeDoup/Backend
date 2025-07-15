//Ruta: src/domain/repositories/ISucursalRepository.ts

import { Sucursal } from '@/domain/entities/Sucursal';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface SucursalFilters {
  empresa_id?: string;
  nombre?: string;
  codigo?: string;
  ciudad?: string;
  activo?: boolean;
}

export interface ISucursalRepository {
  create(sucursal: Omit<Sucursal, 'id' | 'created_at' | 'updated_at'>): Promise<Sucursal>;
  findById(id: string): Promise<Sucursal | null>;
  findByCode(codigo: string, empresaId: string): Promise<Sucursal | null>;
  findByEmpresa(
    empresaId: string,
    pagination: PaginationParams,
    filters?: Omit<SucursalFilters, 'empresa_id'>
  ): Promise<PaginatedResponse<Sucursal>>;
  findAll(
    pagination: PaginationParams,
    filters?: SucursalFilters
  ): Promise<PaginatedResponse<Sucursal>>;
  update(id: string, data: Partial<Sucursal>): Promise<Sucursal>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByCode(codigo: string, empresaId: string, excludeId?: string): Promise<boolean>;
  count(filters?: SucursalFilters): Promise<number>;
  countByEmpresa(empresaId: string): Promise<number>;
}