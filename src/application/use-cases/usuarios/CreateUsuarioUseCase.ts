// Ruta: src/application/use-cases/usuarios/CreateUsuarioUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { AuthConfig } from '@/infrastructure/config/auth';
import { CreateUsuarioDTO, UsuarioResponseDTO, getUserRoleDescription } from '@/application/dtos/UsuarioDTO';
import { ValidationError, NotFoundError } from '@/shared/errors/AppError';
import { validateEmail, validatePassword, validateCedula } from '@/shared/utils/validators';
import { UserRole } from '@/shared/types/common';

export class CreateUsuarioUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository
  ) {}

  async execute(
    userData: CreateUsuarioDTO,
    createdByUserId: string,
    createdByUserRole: UserRole,
    createdByEmpresaId: string
  ): Promise<UsuarioResponseDTO> {
    
    // ========== Validaciones de Entrada ==========
    await this.validateInput(userData);
    
    // ========== Validaciones de Permisos ==========
    await this.validatePermissions(userData, createdByUserRole, createdByEmpresaId);
    
    // ========== Validaciones de Negocio ==========
    await this.validateBusinessRules(userData);
    
    // ========== Crear Usuario ==========
    const hashedPassword = await AuthConfig.hashPassword(userData.password);
    
    const usuario = await this.usuarioRepository.create({
      empresa_id: userData.empresa_id,
      sucursal_id: userData.sucursal_id,
      email: userData.email.toLowerCase().trim(),
      password_hash: hashedPassword,
      nombres: userData.nombres.trim(),
      apellidos: userData.apellidos.trim(),
      rol: userData.rol,
      telefono: userData.telefono?.replace(/\D/g, '') || undefined, // Solo números
      cedula: userData.cedula?.replace(/\D/g, '') || undefined, // Solo números
      direccion: userData.direccion?.trim(),
      fecha_nacimiento: userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento) : undefined,
      activo: true
    });

    // ========== Obtener Datos Relacionados ==========
    const empresa = await this.empresaRepository.findById(usuario.empresa_id);
    let sucursal = null;
    if (usuario.sucursal_id) {
      sucursal = await this.sucursalRepository.findById(usuario.sucursal_id);
    }

    // ========== Mapear Respuesta ==========
    return {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      empresa_nombre: empresa?.nombre,
      sucursal_id: usuario.sucursal_id,
      sucursal_nombre: sucursal?.nombre,
      sucursal_codigo: sucursal?.codigo,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
      rol: usuario.rol,
      rol_descripcion: getUserRoleDescription(usuario.rol),
      telefono: usuario.telefono,
      cedula: usuario.cedula,
      direccion: usuario.direccion,
      fecha_nacimiento: usuario.fecha_nacimiento?.toISOString().split('T')[0],
      activo: usuario.activo,
      ultimo_login: usuario.ultimo_login,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    };
  }

  private async validateInput(userData: CreateUsuarioDTO): Promise<void> {
    // Validar email
    if (!validateEmail(userData.email)) {
      throw new ValidationError('Email inválido', 'email');
    }

    // Validar contraseña
    if (!validatePassword(userData.password)) {
      throw new ValidationError(
        'La contraseña debe tener al menos 8 caracteres, una letra y un número',
        'password'
      );
    }

    // Validar nombres
    if (!userData.nombres || userData.nombres.trim().length < 2) {
      throw new ValidationError('Nombres debe tener al menos 2 caracteres', 'nombres');
    }
    if (userData.nombres.length > 100) {
      throw new ValidationError('Nombres no puede exceder 100 caracteres', 'nombres');
    }

    // Validar apellidos
    if (!userData.apellidos || userData.apellidos.trim().length < 2) {
      throw new ValidationError('Apellidos debe tener al menos 2 caracteres', 'apellidos');
    }
    if (userData.apellidos.length > 100) {
      throw new ValidationError('Apellidos no puede exceder 100 caracteres', 'apellidos');
    }

    // Validar rol
    const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'supervisor', 'viewer'];
    if (!validRoles.includes(userData.rol)) {
      throw new ValidationError('Rol inválido', 'rol');
    }

    // Validar cédula si se proporciona
    if (userData.cedula && !validateCedula(userData.cedula)) {
      throw new ValidationError('Cédula ecuatoriana inválida', 'cedula');
    }

    // Validar teléfono si se proporciona
    if (userData.telefono) {
      const cleanPhone = userData.telefono.replace(/\D/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        throw new ValidationError('Teléfono debe tener entre 7 y 15 dígitos', 'telefono');
      }
    }

    // Validar fecha de nacimiento si se proporciona
    if (userData.fecha_nacimiento) {
      const birthDate = new Date(userData.fecha_nacimiento);
      const today = new Date();
      
      if (birthDate > today) {
        throw new ValidationError('Fecha de nacimiento no puede ser futura', 'fecha_nacimiento');
      }
      
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 16);
      if (birthDate > minAge) {
        throw new ValidationError('El usuario debe tener al menos 16 años', 'fecha_nacimiento');
      }
    }
  }

  private async validatePermissions(
    userData: CreateUsuarioDTO,
    createdByUserRole: UserRole,
    createdByEmpresaId: string
  ): Promise<void> {
    // Super admin puede crear cualquier usuario
    if (createdByUserRole === 'super_admin') {
      return;
    }

    // Admin solo puede crear usuarios en su empresa
    if (createdByUserRole === 'admin') {
      if (userData.empresa_id !== createdByEmpresaId) {
        throw new ValidationError(
          'No tienes permisos para crear usuarios en esta empresa',
          'empresa_id'
        );
      }
      
      // Admin no puede crear super_admins
      if (userData.rol === 'super_admin') {
        throw new ValidationError(
          'No tienes permisos para crear super administradores',
          'rol'
        );
      }
      
      return;
    }

    // Manager puede crear usuarios básicos en su empresa
    if (createdByUserRole === 'manager') {
      if (userData.empresa_id !== createdByEmpresaId) {
        throw new ValidationError(
          'No tienes permisos para crear usuarios en esta empresa',
          'empresa_id'
        );
      }
      
      // Manager solo puede crear viewer y supervisor
      if (!['viewer', 'supervisor'].includes(userData.rol)) {
        throw new ValidationError(
          'Solo puedes crear usuarios con rol Visualizador o Supervisor',
          'rol'
        );
      }
      
      return;
    }

    // Otros roles no pueden crear usuarios
    throw new ValidationError(
      'No tienes permisos para crear usuarios',
      'rol'
    );
  }

  private async validateBusinessRules(userData: CreateUsuarioDTO): Promise<void> {
    // Verificar que la empresa existe y está activa
    const empresa = await this.empresaRepository.findById(userData.empresa_id);
    if (!empresa) {
      throw new NotFoundError('Empresa');
    }
    if (!empresa.activo) {
      throw new ValidationError('No se puede crear usuario en empresa inactiva', 'empresa_id');
    }

    // Verificar que la sucursal existe y pertenece a la empresa (si se especifica)
    if (userData.sucursal_id) {
      const sucursal = await this.sucursalRepository.findById(userData.sucursal_id);
      if (!sucursal) {
        throw new NotFoundError('Sucursal');
      }
      if (!sucursal.activo) {
        throw new ValidationError('No se puede asignar usuario a sucursal inactiva', 'sucursal_id');
      }
      if (sucursal.empresa_id !== userData.empresa_id) {
        throw new ValidationError(
          'La sucursal no pertenece a la empresa especificada',
          'sucursal_id'
        );
      }
    }

    // Verificar que el email no existe
    const existingUserByEmail = await this.usuarioRepository.existsByEmail(userData.email);
    if (existingUserByEmail) {
      throw new ValidationError('El email ya está registrado', 'email');
    }

    // Verificar que la cédula no existe en la empresa (si se proporciona)
    if (userData.cedula) {
      const existingUserByCedula = await this.usuarioRepository.existsByCedula(
        userData.cedula,
        userData.empresa_id
      );
      if (existingUserByCedula) {
        throw new ValidationError(
          'La cédula ya está registrada en esta empresa',
          'cedula'
        );
      }
    }

    // Validaciones específicas por rol
    await this.validateRoleSpecificRules(userData);
  }

  private async validateRoleSpecificRules(userData: CreateUsuarioDTO): Promise<void> {
    switch (userData.rol) {
      case 'super_admin':
        // Super admin no necesita sucursal
        break;

      case 'admin':
        // Admin no necesita sucursal específica, maneja toda la empresa
        break;

      case 'manager':
        // Manager debe tener sucursal asignada
        if (!userData.sucursal_id) {
          throw new ValidationError(
            'Los gerentes deben tener una sucursal asignada',
            'sucursal_id'
          );
        }
        break;

      case 'supervisor':
        // Supervisor debe tener sucursal asignada
        if (!userData.sucursal_id) {
          throw new ValidationError(
            'Los supervisores deben tener una sucursal asignada',
            'sucursal_id'
          );
        }
        break;

      case 'viewer':
        // Viewer puede o no tener sucursal asignada
        break;

      default:
        throw new ValidationError('Rol no válido', 'rol');
    }

    // Validar límites por empresa (opcional)
    await this.validateCompanyLimits(userData);
  }

  private async validateCompanyLimits(userData: CreateUsuarioDTO): Promise<void> {
    // Contar usuarios existentes por rol en la empresa
    const existingAdmins = await this.usuarioRepository.countByRole('admin', userData.empresa_id);
    
    // Limitar administradores por empresa (ejemplo: máximo 5)
    if (userData.rol === 'admin' && existingAdmins >= 5) {
      throw new ValidationError(
        'Se ha alcanzado el límite máximo de administradores para esta empresa',
        'rol'
      );
    }

    // Si hay sucursal, validar límites por sucursal
    if (userData.sucursal_id) {
      const existingManagersInBranch = await this.usuarioRepository.countBySucursal(
        userData.sucursal_id,
        { rol: 'manager' }
      );

      // Limitar gerentes por sucursal (ejemplo: máximo 2)
      if (userData.rol === 'manager' && existingManagersInBranch >= 2) {
        throw new ValidationError(
          'Se ha alcanzado el límite máximo de gerentes para esta sucursal',
          'rol'
        );
      }
    }
  }
}