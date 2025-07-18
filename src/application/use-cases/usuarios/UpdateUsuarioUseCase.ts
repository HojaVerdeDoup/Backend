// Ruta: src/application/use-cases/usuarios/UpdateUsuarioUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { UpdateUsuarioDTO, UsuarioResponseDTO, getUserRoleDescription } from '@/application/dtos/UsuarioDTO';
import { Usuario } from '@/domain/entities/Usuario';
import { UserRole } from '@/shared/types/common';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';
import { validateEmail, validateCedula } from '@/shared/utils/validators';

export class UpdateUsuarioUseCase {
  constructor(
    private usuarioRepository: IUsuarioRepository,
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository
  ) {}

  async execute(
    id: string,
    updateData: UpdateUsuarioDTO,
    updatedByUserId: string,
    updatedByUserRole: UserRole,
    updatedByEmpresaId: string,
    updatedBySucursalId?: string
  ): Promise<UsuarioResponseDTO> {
    
    // ========== Validar que el usuario existe ==========
    const existingUser = await this.usuarioRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundError('Usuario');
    }

    // ========== Validar permisos de actualización ==========
    await this.validateUpdatePermissions(
      existingUser,
      updateData,
      updatedByUserId,
      updatedByUserRole,
      updatedByEmpresaId,
      updatedBySucursalId
    );

    // ========== Validar datos de entrada ==========
    await this.validateUpdateData(updateData, existingUser);

    // ========== Validar reglas de negocio ==========
    await this.validateBusinessRules(updateData, existingUser);

    // ========== Preparar datos para actualización ==========
    const dataToUpdate: Partial<Usuario> = {};
    
    if (updateData.nombres !== undefined) {
      dataToUpdate.nombres = updateData.nombres.trim();
    }
    if (updateData.apellidos !== undefined) {
      dataToUpdate.apellidos = updateData.apellidos.trim();
    }
    if (updateData.email !== undefined) {
      dataToUpdate.email = updateData.email.toLowerCase().trim();
    }
    if (updateData.rol !== undefined) {
      dataToUpdate.rol = updateData.rol;
    }
    if (updateData.sucursal_id !== undefined) {
      // Convertir null a undefined para compatibilidad con Usuario
      dataToUpdate.sucursal_id = updateData.sucursal_id || undefined;
    }
    if (updateData.telefono !== undefined) {
      // Convertir null a undefined y limpiar formato
      dataToUpdate.telefono = updateData.telefono?.replace(/\D/g, '') || undefined;
    }
    if (updateData.cedula !== undefined) {
      // Convertir null a undefined y limpiar formato
      dataToUpdate.cedula = updateData.cedula?.replace(/\D/g, '') || undefined;
    }
    if (updateData.direccion !== undefined) {
      // Convertir null a undefined
      dataToUpdate.direccion = updateData.direccion?.trim() || undefined;
    }
    if (updateData.fecha_nacimiento !== undefined) {
      // Convertir null a undefined
      dataToUpdate.fecha_nacimiento = updateData.fecha_nacimiento 
        ? new Date(updateData.fecha_nacimiento) 
        : undefined;
    }
    if (updateData.activo !== undefined) {
      dataToUpdate.activo = updateData.activo;
    }

    // ========== Actualizar usuario ==========
    const updatedUser = await this.usuarioRepository.update(id, dataToUpdate);

    // ========== Obtener datos relacionados ==========
    const empresa = await this.empresaRepository.findById(updatedUser.empresa_id);
    let sucursal = null;
    if (updatedUser.sucursal_id) {
      sucursal = await this.sucursalRepository.findById(updatedUser.sucursal_id);
    }

    // ========== Mapear respuesta ==========
    return {
      id: updatedUser.id,
      empresa_id: updatedUser.empresa_id,
      empresa_nombre: empresa?.nombre,
      sucursal_id: updatedUser.sucursal_id,
      sucursal_nombre: sucursal?.nombre,
      sucursal_codigo: sucursal?.codigo,
      email: updatedUser.email,
      nombres: updatedUser.nombres,
      apellidos: updatedUser.apellidos,
      nombre_completo: `${updatedUser.nombres} ${updatedUser.apellidos}`,
      rol: updatedUser.rol,
      rol_descripcion: getUserRoleDescription(updatedUser.rol),
      telefono: this.formatTelefono(updatedUser.telefono),
      cedula: this.formatCedula(updatedUser.cedula),
      direccion: updatedUser.direccion,
      fecha_nacimiento: updatedUser.fecha_nacimiento?.toISOString().split('T')[0],
      activo: updatedUser.activo,
      ultimo_login: updatedUser.ultimo_login,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at
    };
  }

  private async validateUpdatePermissions(
    existingUser: Usuario,
    updateData: UpdateUsuarioDTO,
    updatedByUserId: string,
    updatedByUserRole: UserRole,
    updatedByEmpresaId: string,
    updatedBySucursalId?: string
  ): Promise<void> {
    
    // Validaciones específicas para auto-actualización
    const isSelfUpdate = updatedByUserId === existingUser.id;
    
    if (isSelfUpdate) {
      // Los usuarios pueden actualizar algunos campos propios
      const allowedSelfFields = ['nombres', 'apellidos', 'telefono', 'direccion', 'fecha_nacimiento'];
      const attemptedFields = Object.keys(updateData);
      
      const forbiddenFields = attemptedFields.filter(field => !allowedSelfFields.includes(field));
      if (forbiddenFields.length > 0) {
        throw new ValidationError(
          `No puedes modificar estos campos: ${forbiddenFields.join(', ')}`,
          'fields'
        );
      }
      
      return; // El usuario puede actualizar sus propios datos permitidos
    }

    // Validaciones para actualización de otros usuarios
    switch (updatedByUserRole) {
      case 'super_admin':
        // Super admin puede actualizar cualquier usuario
        return;

      case 'admin':
        // Admin solo puede actualizar usuarios de su empresa
        if (existingUser.empresa_id !== updatedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para actualizar usuarios de esta empresa',
            'empresa_id'
          );
        }
        
        // Admin no puede actualizar super_admins
        if (existingUser.rol === 'super_admin') {
          throw new ValidationError(
            'No tienes permisos para actualizar super administradores',
            'rol'
          );
        }
        
        // Admin no puede promocionar a super_admin
        if (updateData.rol === 'super_admin') {
          throw new ValidationError(
            'No tienes permisos para asignar el rol de super administrador',
            'rol'
          );
        }
        
        return;

      case 'manager':
        // Manager puede actualizar usuarios básicos de su empresa
        if (existingUser.empresa_id !== updatedByEmpresaId) {
          throw new ValidationError(
            'No tienes permisos para actualizar usuarios de esta empresa',
            'empresa_id'
          );
        }
        
        // Manager solo puede actualizar viewer y supervisor
        if (!['viewer', 'supervisor'].includes(existingUser.rol)) {
          throw new ValidationError(
            'Solo puedes actualizar usuarios con rol Visualizador o Supervisor',
            'rol'
          );
        }
        
        // Manager no puede cambiar roles a admin o superior
        if (updateData.rol && !['viewer', 'supervisor'].includes(updateData.rol)) {
          throw new ValidationError(
            'Solo puedes asignar los roles Visualizador o Supervisor',
            'rol'
          );
        }
        
        return;

      case 'supervisor':
      case 'viewer':
        // Estos roles no pueden actualizar otros usuarios
        throw new ValidationError(
          'No tienes permisos para actualizar otros usuarios',
          'rol'
        );

      default:
        throw new ValidationError('Rol no autorizado para esta operación', 'rol');
    }
  }

  private async validateUpdateData(updateData: UpdateUsuarioDTO, existingUser: Usuario): Promise<void> {
    // Validar email si se proporciona
    if (updateData.email && !validateEmail(updateData.email)) {
      throw new ValidationError('Email inválido', 'email');
    }

    // Validar nombres si se proporcionan
    if (updateData.nombres !== undefined) {
      if (!updateData.nombres || updateData.nombres.trim().length < 2) {
        throw new ValidationError('Nombres debe tener al menos 2 caracteres', 'nombres');
      }
      if (updateData.nombres.length > 100) {
        throw new ValidationError('Nombres no puede exceder 100 caracteres', 'nombres');
      }
    }

    // Validar apellidos si se proporcionan
    if (updateData.apellidos !== undefined) {
      if (!updateData.apellidos || updateData.apellidos.trim().length < 2) {
        throw new ValidationError('Apellidos debe tener al menos 2 caracteres', 'apellidos');
      }
      if (updateData.apellidos.length > 100) {
        throw new ValidationError('Apellidos no puede exceder 100 caracteres', 'apellidos');
      }
    }

    // Validar rol si se proporciona
    if (updateData.rol !== undefined) {
      const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'supervisor', 'viewer'];
      if (!validRoles.includes(updateData.rol)) {
        throw new ValidationError('Rol inválido', 'rol');
      }
    }

    // Validar cédula si se proporciona
    if (updateData.cedula && !validateCedula(updateData.cedula)) {
      throw new ValidationError('Cédula ecuatoriana inválida', 'cedula');
    }

    // Validar teléfono si se proporciona
    if (updateData.telefono) {
      const cleanPhone = updateData.telefono.replace(/\D/g, '');
      if (cleanPhone.length < 7 || cleanPhone.length > 15) {
        throw new ValidationError('Teléfono debe tener entre 7 y 15 dígitos', 'telefono');
      }
    }

    // Validar fecha de nacimiento si se proporciona
    if (updateData.fecha_nacimiento) {
      const birthDate = new Date(updateData.fecha_nacimiento);
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

  private async validateBusinessRules(updateData: UpdateUsuarioDTO, existingUser: Usuario): Promise<void> {
    // Verificar email único si se está cambiando
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.usuarioRepository.existsByEmail(updateData.email, existingUser.id);
      if (emailExists) {
        throw new ValidationError('El email ya está registrado', 'email');
      }
    }

    // Verificar cédula única en empresa si se está cambiando
    if (updateData.cedula && updateData.cedula !== existingUser.cedula) {
      const cedulaExists = await this.usuarioRepository.existsByCedula(
        updateData.cedula,
        existingUser.empresa_id,
        existingUser.id
      );
      if (cedulaExists) {
        throw new ValidationError(
          'La cédula ya está registrada en esta empresa',
          'cedula'
        );
      }
    }

    // Verificar sucursal si se está cambiando
    if (updateData.sucursal_id !== undefined && updateData.sucursal_id !== existingUser.sucursal_id) {
      if (updateData.sucursal_id) {
        const sucursal = await this.sucursalRepository.findById(updateData.sucursal_id);
        if (!sucursal) {
          throw new NotFoundError('Sucursal');
        }
        if (!sucursal.activo) {
          throw new ValidationError('No se puede asignar usuario a sucursal inactiva', 'sucursal_id');
        }
        if (sucursal.empresa_id !== existingUser.empresa_id) {
          throw new ValidationError(
            'La sucursal no pertenece a la empresa del usuario',
            'sucursal_id'
          );
        }
      }
    }

    // Validaciones específicas por rol si se está cambiando
    if (updateData.rol && updateData.rol !== existingUser.rol) {
      await this.validateRoleChangeRules(updateData, existingUser);
    }

    // Validar que no se desactive el último admin de la empresa
    if (updateData.activo === false && existingUser.rol === 'admin') {
      const adminCount = await this.usuarioRepository.countByRole('admin', existingUser.empresa_id);
      if (adminCount <= 1) {
        throw new ValidationError(
          'No se puede desactivar el último administrador de la empresa',
          'activo'
        );
      }
    }
  }

  private async validateRoleChangeRules(updateData: UpdateUsuarioDTO, existingUser: Usuario): Promise<void> {
    const newRole = updateData.rol!;

    switch (newRole) {
      case 'super_admin':
        // Solo super_admin puede promocionar a super_admin (ya validado en permisos)
        break;

      case 'admin':
        // Verificar límite de admins por empresa
        const adminCount = await this.usuarioRepository.countByRole('admin', existingUser.empresa_id);
        if (adminCount >= 5) { // Límite ejemplo
          throw new ValidationError(
            'Se ha alcanzado el límite máximo de administradores para esta empresa',
            'rol'
          );
        }
        break;

      case 'manager':
        // Manager debe tener sucursal asignada
        const sucursalId = updateData.sucursal_id !== undefined ? updateData.sucursal_id : existingUser.sucursal_id;
        if (!sucursalId) {
          throw new ValidationError(
            'Los gerentes deben tener una sucursal asignada',
            'sucursal_id'
          );
        }
        
        // Verificar límite de managers por sucursal
        const managerCount = await this.usuarioRepository.countBySucursal(sucursalId, { rol: 'manager' });
        if (managerCount >= 2 && existingUser.rol !== 'manager') { // Límite ejemplo
          throw new ValidationError(
            'Se ha alcanzado el límite máximo de gerentes para esta sucursal',
            'rol'
          );
        }
        break;

      case 'supervisor':
        // Supervisor debe tener sucursal asignada
        const supervisorSucursalId = updateData.sucursal_id !== undefined ? updateData.sucursal_id : existingUser.sucursal_id;
        if (!supervisorSucursalId) {
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
  }

  private formatTelefono(telefono?: string): string | undefined {
    if (!telefono) return undefined;
    
    const cleanPhone = telefono.replace(/\D/g, '');
    
    // Formato para celular ecuatoriano: 099 123 4567
    if (cleanPhone.length === 10 && cleanPhone.startsWith('09')) {
      return `${cleanPhone.substring(0, 3)} ${cleanPhone.substring(3, 6)} ${cleanPhone.substring(6)}`;
    }
    
    // Formato para convencional: (02) 234 5678
    if (cleanPhone.length === 9 && cleanPhone.startsWith('0')) {
      return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
    }
    
    return telefono;
  }

  private formatCedula(cedula?: string): string | undefined {
    if (!cedula) return undefined;
    
    // Formato: 1234567890 -> 123456789-0
    if (cedula.length === 10) {
      return `${cedula.substring(0, 9)}-${cedula.substring(9)}`;
    }
    
    return cedula;
  }
}