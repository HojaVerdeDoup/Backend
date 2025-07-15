// Ruta: src/application/dtos/SucursalDTO.ts

export interface CreateSucursalDTO {
  empresa_id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
}

export interface UpdateSucursalDTO {
  nombre?: string;
  codigo?: string;
  direccion?: string | null; // Permitir null para limpiar el campo
  telefono?: string | null; // Permitir null para limpiar el campo
  ciudad?: string | null; // Permitir null para limpiar el campo
  activo?: boolean;
}

export interface SucursalResponseDTO {
  id: string;
  empresa_id: string;
  empresa_nombre?: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  nombre_completo: string;
  activo: boolean;
  total_empleados?: number;
  created_at: Date;
  updated_at: Date;
}

export interface SucursalListDTO {
  id: string;
  empresa_id: string;
  empresa_nombre: string;
  nombre: string;
  codigo: string;
  ciudad?: string;
  nombre_completo: string;
  activo: boolean;
  total_empleados: number;
  created_at: Date;
}

export interface SucursalFiltersDTO {
  empresa_id?: string;
  nombre?: string;
  codigo?: string;
  ciudad?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}