// Ruta: src/domain/entities/Departamento.ts

export interface Departamento {
  id: string;
  empresa_id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  departamento_padre_id?: string;
  responsable_id?: string;
  nivel: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}