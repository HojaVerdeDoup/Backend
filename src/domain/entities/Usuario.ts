// Ruta: src/domain/entities/Usuario.ts (ACTUALIZAR ARCHIVO EXISTENTE)

import { BaseEntity, UserRole } from '@/shared/types/common';
import { validateEmail, validateCedula } from '@/shared/utils/validators';

export interface Usuario extends BaseEntity {
  empresa_id: string;
  sucursal_id?: string;
  email: string;
  password_hash: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
  telefono?: string;
  cedula?: string;
  direccion?: string;
  fecha_nacimiento?: Date;
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
    public readonly telefono?: string,
    public readonly cedula?: string,
    public readonly direccion?: string,
    public readonly fecha_nacimiento?: Date,
    public readonly activo: boolean = true,
    public readonly ultimo_login?: Date,
    public readonly created_at?: Date,
    public readonly updated_at?: Date
  ) {
    this.validateEmail();
    this.validateNames();
    this.validateRole();
    this.validateCedula();
    this.validateTelefono();
    this.validateFechaNacimiento();
    this.validateEmpresaId();
  }

  private validateEmail(): void {
    if (!validateEmail(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private validateNames(): void {
    if (!this.nombres.trim() || this.nombres.trim().length < 2) {
      throw new Error('Nombres debe tener al menos 2 caracteres');
    }
    if (!this.apellidos.trim() || this.apellidos.trim().length < 2) {
      throw new Error('Apellidos debe tener al menos 2 caracteres');
    }
    if (this.nombres.length > 100) {
      throw new Error('Nombres no puede exceder 100 caracteres');
    }
    if (this.apellidos.length > 100) {
      throw new Error('Apellidos no puede exceder 100 caracteres');
    }
    
    // Solo letras, espacios y acentos
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nameRegex.test(this.nombres)) {
      throw new Error('Nombres solo puede contener letras y espacios');
    }
    if (!nameRegex.test(this.apellidos)) {
      throw new Error('Apellidos solo puede contener letras y espacios');
    }
  }

  private validateRole(): void {
    const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'supervisor', 'viewer'];
    if (!validRoles.includes(this.rol)) {
      throw new Error('Rol inválido');
    }
  }

  private validateCedula(): void {
    if (this.cedula && !validateCedula(this.cedula)) {
      throw new Error('Cédula ecuatoriana inválida');
    }
  }

  private validateTelefono(): void {
    if (this.telefono) {
      // Limpiar formato para validación
      const cleanPhone = this.telefono.replace(/[\s\-\(\)]/g, '');
      if (!/^\d{7,15}$/.test(cleanPhone)) {
        throw new Error('Teléfono debe tener entre 7 y 15 dígitos');
      }
      
      // Validación específica para Ecuador
      if (cleanPhone.length === 10) {
        // Celular: 09XXXXXXXX
        if (cleanPhone.startsWith('09')) {
          if (!/^09[0-9]{8}$/.test(cleanPhone)) {
            throw new Error('Número celular ecuatoriano inválido');
          }
        }
        // Convencional: 0[2-7]XXXXXXX
        else if (cleanPhone.startsWith('0')) {
          const areaCode = cleanPhone.substring(1, 2);
          if (!['2', '3', '4', '5', '6', '7'].includes(areaCode)) {
            throw new Error('Código de área inválido para teléfono convencional');
          }
        }
      }
    }
  }

  private validateFechaNacimiento(): void {
    if (this.fecha_nacimiento) {
      const today = new Date();
      const birthDate = new Date(this.fecha_nacimiento);
      
      // No puede ser futura
      if (birthDate > today) {
        throw new Error('Fecha de nacimiento no puede ser futura');
      }
      
      // Edad mínima 16 años
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 16);
      if (birthDate > minAge) {
        throw new Error('El usuario debe tener al menos 16 años');
      }
      
      // Edad máxima 100 años
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 100);
      if (birthDate < maxAge) {
        throw new Error('Fecha de nacimiento no válida');
      }
    }
  }

  private validateEmpresaId(): void {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!this.empresa_id || !uuidRegex.test(this.empresa_id)) {
      throw new Error('ID de empresa debe ser un UUID válido');
    }
  }

  // ========== Getters y Métodos de Negocio ==========
  
  get nombre_completo(): string {
    return `${this.nombres} ${this.apellidos}`;
  }

  get iniciales(): string {
    const primNombre = this.nombres.split(' ')[0];
    const primApellido = this.apellidos.split(' ')[0];
    return `${primNombre.charAt(0)}${primApellido.charAt(0)}`.toUpperCase();
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

  get can_manage_usuarios(): boolean {
    return ['super_admin', 'admin'].includes(this.rol);
  }

  get can_create_usuarios(): boolean {
    return ['super_admin', 'admin', 'manager'].includes(this.rol);
  }

  get can_view_all_data(): boolean {
    return ['super_admin', 'admin'].includes(this.rol);
  }

  get edad(): number | null {
    if (!this.fecha_nacimiento) return null;
    
    const today = new Date();
    const birthDate = new Date(this.fecha_nacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  get telefono_formatted(): string | undefined {
    if (!this.telefono) return undefined;
    
    const cleanPhone = this.telefono.replace(/[\s\-\(\)]/g, '');
    
    // Formato para celular ecuatoriano: 099 123 4567
    if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
      return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    }
    
    // Formato para convencional: (02) 234 5678
    if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
    }
    
    return this.telefono;
  }

  get cedula_formatted(): string | undefined {
    if (!this.cedula) return undefined;
    
    // Formato: 1234567890 -> 123456789-0
    if (this.cedula.length === 10) {
      return `${this.cedula.substring(0, 9)}-${this.cedula.substring(9)}`;
    }
    
    return this.cedula;
  }

  get rol_description(): string {
    const descriptions = {
      super_admin: 'Super Administrador',
      admin: 'Administrador',
      manager: 'Gerente',
      supervisor: 'Supervisor',
      viewer: 'Visualizador'
    };
    return descriptions[this.rol] || this.rol;
  }

  // ========== Métodos de Validación de Permisos ==========
  
  canAccessEmpresa(empresaId: string): boolean {
    if (this.rol === 'super_admin') return true;
    return this.empresa_id === empresaId;
  }

  canAccessSucursal(sucursalId: string, empresaId?: string): boolean {
    if (this.rol === 'super_admin') return true;
    if (empresaId && this.empresa_id !== empresaId) return false;
    
    if (['admin'].includes(this.rol)) return true;
    if (['manager', 'supervisor'].includes(this.rol)) {
      return this.sucursal_id === sucursalId;
    }
    
    return false;
  }

  canManageUser(targetUserId: string, targetUserRole: UserRole, targetEmpresaId: string): boolean {
    // Super admin puede gestionar cualquier usuario
    if (this.rol === 'super_admin') return true;
    
    // No puede gestionarse a sí mismo para cambios críticos
    if (this.id === targetUserId) return false;
    
    // Admin solo puede gestionar usuarios de su empresa
    if (this.rol === 'admin') {
      if (this.empresa_id !== targetEmpresaId) return false;
      // Admin no puede gestionar super_admins
      if (targetUserRole === 'super_admin') return false;
      return true;
    }
    
    // Manager puede crear usuarios básicos en su sucursal
    if (this.rol === 'manager') {
      if (this.empresa_id !== targetEmpresaId) return false;
      // Solo puede crear viewer/supervisor
      return ['viewer', 'supervisor'].includes(targetUserRole);
    }
    
    return false;
  }

  hasPermission(permission: string): boolean {
    const permissions = {
      super_admin: [
        'create_empresa', 'edit_empresa', 'delete_empresa', 'view_empresa',
        'create_sucursal', 'edit_sucursal', 'delete_sucursal', 'view_sucursal',
        'create_usuario', 'edit_usuario', 'delete_usuario', 'view_usuario',
        'manage_all_data', 'view_all_reports', 'export_data', 'import_data'
      ],
      admin: [
        'edit_empresa', 'view_empresa',
        'create_sucursal', 'edit_sucursal', 'delete_sucursal', 'view_sucursal',
        'create_usuario', 'edit_usuario', 'delete_usuario', 'view_usuario',
        'manage_company_data', 'view_company_reports', 'export_company_data', 'import_company_data'
      ],
      manager: [
        'view_empresa', 'view_sucursal',
        'create_usuario', 'edit_usuario', 'view_usuario',
        'manage_branch_data', 'view_branch_reports', 'export_branch_data'
      ],
      supervisor: [
        'view_sucursal', 'view_usuario',
        'view_area_data', 'view_area_reports'
      ],
      viewer: [
        'view_sucursal', 'view_usuario',
        'view_assigned_data'
      ]
    };
    
    return (permissions[this.rol] || []).includes(permission);
  }
}