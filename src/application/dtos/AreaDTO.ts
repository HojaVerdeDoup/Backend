// Ruta: src/application/dtos/AreaDTO.ts

import { DiaLaborable } from '../../domain/entities/Area';

export interface CreateAreaDTO {
  empresa_id: string;
  sucursal_id: string;
  departamento_id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  responsable_id?: string;
  horario_entrada?: string; // Default: '08:00:00'
  horario_salida?: string; // Default: '17:00:00'
  tolerancia_entrada?: number; // Default: 15
  tolerancia_salida?: number; // Default: 15
  dias_laborables?: Partial<DiaLaborable>; // Se completará con defaults
  ubicacion_fisica?: string;
  capacidad_maxima?: number;
}

export interface UpdateAreaDTO {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  responsable_id?: string;
  horario_entrada?: string;
  horario_salida?: string;
  tolerancia_entrada?: number;
  tolerancia_salida?: number;
  dias_laborables?: DiaLaborable;
  ubicacion_fisica?: string;
  capacidad_maxima?: number;
  activo?: boolean;
}

export interface AreaResponseDTO {
  id: string;
  empresa_id: string;
  empresa_nombre?: string;
  sucursal_id: string;
  sucursal_nombre?: string;
  sucursal_codigo?: string;
  departamento_id: string;
  departamento_nombre?: string;
  departamento_codigo?: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  horario_entrada: string;
  horario_salida: string;
  tolerancia_entrada: number;
  tolerancia_salida: number;
  dias_laborables: DiaLaborable;
  ubicacion_fisica?: string;
  capacidad_maxima?: number;
  usuarios_count?: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AreaListDTO {
  id: string;
  empresa_id: string;
  empresa_nombre: string;
  sucursal_id: string;
  sucursal_nombre: string;
  sucursal_codigo: string;
  departamento_id: string;
  departamento_nombre: string;
  departamento_codigo: string;
  nombre: string;
  codigo: string;
  responsable_nombre: string;
  horario_entrada: string;
  horario_salida: string;
  capacidad_maxima?: number;
  usuarios_count: number;
  activo: boolean;
  created_at: Date;
}

export interface AreaFiltersDTO {
  page?: number;
  limit?: number;
  empresa_id?: string;
  sucursal_id?: string;
  departamento_id?: string;
  nombre?: string;
  codigo?: string;
  responsable_id?: string;
  activo?: boolean;
  search?: string; // Búsqueda global en nombre, descripción y ubicación
}

export interface AreaHorarioDTO {
  horario_entrada: string;
  horario_salida: string;
  tolerancia_entrada: number;
  tolerancia_salida: number;
  dias_laborables: DiaLaborable;
}