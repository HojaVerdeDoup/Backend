//Ruta: src/domain/repositories/IEmpresaRepository.ts

import { Empresa } from '@/domain/entities/Empresa';
import { PaginationParams, PaginatedResponse } from '@/shared/types/common';

export interface EmpresaFilters {
  nombre?: string;
  ruc?: string;
  activo?: boolean;
}

export interface IEmpresaRepository {
  create(empresa: Omit<Empresa, 'id' | 'created_at' | 'updated_at'>): Promise<Empresa>;
  findById(id: string): Promise<Empresa | null>;
  findByRuc(ruc: string): Promise<Empresa | null>;
  findAll(
    pagination: PaginationParams,
    filters?: EmpresaFilters
  ): Promise<PaginatedResponse<Empresa>>;
  update(id: string, data: Partial<Empresa>): Promise<Empresa>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(filters?: EmpresaFilters): Promise<number>;
}