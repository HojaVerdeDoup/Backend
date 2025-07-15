//Ruta: src/domain/entities/Sucursal.ts

import { BaseEntity } from '@/shared/types/common';

export interface Sucursal extends BaseEntity {
  empresa_id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  telefono?: string;
  ciudad?: string;
  activo: boolean;
}

export class SucursalEntity {
  constructor(
    public readonly id: string,
    public readonly empresa_id: string,
    public readonly nombre: string,
    public readonly codigo: string,
    public readonly direccion?: string,
    public readonly telefono?: string,
    public readonly ciudad?: string,
    public readonly activo: boolean = true,
    public readonly created_at?: Date,
    public readonly updated_at?: Date
  ) {
    this.validateEmpresaId();
    this.validateNombre();
    this.validateCodigo();
    this.validateTelefono();
  }

  private validateEmpresaId(): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!this.empresa_id || !uuidRegex.test(this.empresa_id)) {
      throw new Error('ID de empresa debe ser un UUID válido');
    }
  }

  private validateNombre(): void {
    if (!this.nombre || this.nombre.trim().length < 2) {
      throw new Error('Nombre de sucursal debe tener al menos 2 caracteres');
    }
    if (this.nombre.length > 100) {
      throw new Error('Nombre de sucursal no puede exceder 100 caracteres');
    }
  }

  private validateCodigo(): void {
    if (!this.codigo || this.codigo.trim().length < 2) {
      throw new Error('Código de sucursal debe tener al menos 2 caracteres');
    }
    if (this.codigo.length > 10) {
      throw new Error('Código de sucursal no puede exceder 10 caracteres');
    }
    // Solo letras, números y guiones
    if (!/^[A-Za-z0-9\-]+$/.test(this.codigo)) {
      throw new Error('Código solo puede contener letras, números y guiones');
    }
  }

  private validateTelefono(): void {
    if (this.telefono && !/^\d{7,15}$/.test(this.telefono.replace(/[\s\-\(\)]/g, ''))) {
      throw new Error('Teléfono debe tener entre 7 y 15 dígitos');
    }
  }

  get codigo_empresa(): string {
    return `${this.empresa_id.substring(0, 8)}-${this.codigo}`;
  }

  get is_active(): boolean {
    return this.activo;
  }

  get nombre_completo(): string {
    return this.ciudad ? `${this.nombre} - ${this.ciudad}` : this.nombre;
  }
}