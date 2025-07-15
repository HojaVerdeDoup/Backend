import { BaseEntity, UserRole } from '@/shared/types/common';

export interface Usuario extends BaseEntity {
  empresa_id: string;
  sucursal_id?: string;
  email: string;
  password_hash: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  activo: boolean;
  ultimo_login?: Date;
}

export class UsuarioEntity {
  constructor(
    public readonly id: string,
    public readonly empresa_id: string,
    public readonly email: string,
    public readonly password_hash: string,
    public readonly nombres: string,
    public readonly apellidos: string,
    public readonly rol: UserRole,
    public readonly sucursal_id?: string,
    public readonly activo: boolean = true,
    public readonly ultimo_login?: Date,
    public readonly created_at?: Date,
    public readonly updated_at?: Date
  ) {
    this.validateEmail();
    this.validateNames();
    this.validateRole();
  }

  private validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private validateNames(): void {
    if (!this.nombres.trim() || !this.apellidos.trim()) {
      throw new Error('Nombres y apellidos son requeridos');
    }
  }

  private validateRole(): void {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'supervisor', 'viewer'];
    if (!validRoles.includes(this.rol)) {
      throw new Error('Rol inválido');
    }
  }

  get nombre_completo(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  get is_admin(): boolean {
    return ['super_admin', 'admin'].includes(this.rol);
  }

  get can_manage_empresa(): boolean {
    return this.rol === 'super_admin';
  }

  get can_manage_sucursal(): boolean {
    return ['super_admin', 'admin', 'manager'].includes(this.rol);
  }
}