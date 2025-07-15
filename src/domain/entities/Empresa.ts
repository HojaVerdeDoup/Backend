//Ruta: src/domain/entities/Empresa.ts
import { BaseEntity } from '@/shared/types/common';

export interface Empresa extends BaseEntity {
  nombre: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  logo_url?: string;
  activo: boolean;
}

export class EmpresaEntity {
  constructor(
    public readonly id: string,
    public readonly nombre: string,
    public readonly ruc: string,
    public readonly direccion?: string,
    public readonly telefono?: string,
    public readonly email?: string,
    public readonly logo_url?: string,
    public readonly activo: boolean = true,
    public readonly created_at?: Date,
    public readonly updated_at?: Date
  ) {
    this.validateNombre();
    this.validateRuc();
    this.validateEmail();
    this.validateTelefono();
  }

  private validateNombre(): void {
    if (!this.nombre || this.nombre.trim().length < 2) {
      throw new Error('Nombre de empresa debe tener al menos 2 caracteres');
    }
    if (this.nombre.length > 150) {
      throw new Error('Nombre de empresa no puede exceder 150 caracteres');
    }
  }

  private validateRuc(): void {
    if (!this.ruc || !/^\d{13}$/.test(this.ruc)) {
      throw new Error('RUC debe tener exactamente 13 dígitos');
    }

    // Validación específica de RUC ecuatoriano
    const provincia = parseInt(this.ruc.substring(0, 2));
    if (provincia < 1 || provincia > 24) {
      throw new Error('RUC inválido: código de provincia incorrecto');
    }

    const tercerDigito = parseInt(this.ruc[2]);
    if (![6, 9].includes(tercerDigito)) {
      throw new Error('RUC inválido: debe ser de sociedad privada (6) o pública (9)');
    }
  }

  private validateEmail(): void {
    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private validateTelefono(): void {
    if (this.telefono && !/^\d{7,15}$/.test(this.telefono.replace(/[\s\-\(\)]/g, ''))) {
      throw new Error('Teléfono debe tener entre 7 y 15 dígitos');
    }
  }

  get ruc_formatted(): string {
    return `${this.ruc.substring(0, 2)}-${this.ruc.substring(2, 10)}-${this.ruc.substring(10)}`;
  }

  get is_active(): boolean {
    return this.activo;
  }
}