// Ruta: src/application/dtos/DepartamentoDTO.ts

export interface CreateDepartamentoDTO {
  empresa_id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  departamento_padre_id?: string;
  responsable_id?: string;
}

export interface UpdateDepartamentoDTO {
  nombre?: string;
  codigo?: string;
  descripcion?: string;
  departamento_padre_id?: string;
  responsable_id?: string;
  activo?: boolean;
}

export interface DepartamentoResponseDTO {
  id: string;
  empresa_id: string;
  empresa_nombre?: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  departamento_padre_id?: string;
  departamento_padre_nombre?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  nivel: number;
  ruta_completa?: string;
  activo: boolean;
  subdepartamentos_count?: number;
  areas_count?: number;
  usuarios_count?: number;
  created_at: Date;
  updated_at: Date;
}

export interface DepartamentoListDTO {
  id: string;
  empresa_id: string;
  empresa_nombre: string;
  nombre: string;
  codigo: string;
  nivel: number;
  ruta_completa: string;
  responsable_nombre: string;
  subdepartamentos_count: number;
  areas_count: number;
  usuarios_count: number;
  activo: boolean;
  created_at: Date;
}

export interface DepartamentoFiltersDTO {
  page?: number;
  limit?: number;
  empresa_id?: string;
  nombre?: string;
  codigo?: string;
  departamento_padre_id?: string;
  responsable_id?: string;
  nivel?: number;
  activo?: boolean;
  search?: string; // Búsqueda global en nombre y descripción
}

export interface DepartamentoJerarquiaDTO {
  id: string;
  empresa_id: string;
  nombre: string;
  codigo: string;
  nivel: number;
  departamento_padre_id?: string;
  responsable_id?: string;
  responsable_nombre: string;
  ruta_completa: string;
  ruta_codigos: string;
  profundidad: number;
  subdepartamentos_count: number;
  areas_count: number;
  usuarios_count: number;
  hijos?: DepartamentoJerarquiaDTO[];
}