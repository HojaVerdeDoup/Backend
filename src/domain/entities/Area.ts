// Ruta: src/domain/entities/Area.ts

export interface DiaLaborable {
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
  sabado: boolean;
  domingo: boolean;
}

export interface Area {
  id: string;
  empresa_id: string;
  sucursal_id: string;
  departamento_id: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
  responsable_id?: string;
  horario_entrada: string; // HH:MM:SS format
  horario_salida: string; // HH:MM:SS format
  tolerancia_entrada: number; // minutos
  tolerancia_salida: number; // minutos
  dias_laborables: DiaLaborable;
  ubicacion_fisica?: string;
  capacidad_maxima?: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}