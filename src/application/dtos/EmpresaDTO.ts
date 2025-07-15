//Ruta: src/application/dtos/EmpresaDTO.ts

export interface CreateEmpresaDTO {
  nombre: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
}

export interface UpdateEmpresaDTO {
  nombre?: string;
  direccion?: string | null; // Permitir null para limpiar el campo
  telefono?: string | null; // Permitir null para limpiar el campo
  email?: string | null; // Permitir null para limpiar el campo
  logo_url?: string | null; // Permitir null para limpiar el campo
  activo?: boolean;
}

export interface EmpresaResponseDTO {
  id: string;
  nombre: string;
  ruc: string;
  ruc_formatted: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  activo: boolean;
  total_sucursales?: number;
  created_at: Date;
  updated_at: Date;
}

export interface EmpresaListDTO {
  id: string;
  nombre: string;
  ruc: string;
  ruc_formatted: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  total_sucursales: number;
  created_at: Date;
}

export interface EmpresaFiltersDTO {
  nombre?: string;
  ruc?: string;
  activo?: boolean;
  page?: number;
  limit?: number;
}