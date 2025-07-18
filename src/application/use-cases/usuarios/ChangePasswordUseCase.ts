// Ruta: src/application/use-cases/usuarios/ChangePasswordUseCase.ts

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { AuthConfig } from '@/infrastructure/config/auth';
import { ChangePasswordDTO } from '@/application/dtos/UsuarioDTO';
import { UserRole } from '@/shared/types/common';
import { NotFoundError, ValidationError, UnauthorizedError } from '@/shared/errors/AppError';
import { validatePassword } from '@/shared/utils/validators';

export class ChangePasswordUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(
    userId: string,
    passwordData: ChangePasswordDTO,
    requestedByUserId: string,
    requestedByUserRole: UserRole
  ): Promise<void> {
    
    // ========== Validar que el usuario existe ==========
    const user = await this.usuarioRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    // ========== Validar permisos ==========
    await this.validateChangePermissions(
      userId,
      requestedByUserId,
      requestedByUserRole,
      user.rol
    );

    // ========== Validar datos de entrada ==========
    await this.validatePasswordData(passwordData, userId === requestedByUserId);

    // ========== Verificar contraseña actual (solo para auto-cambio) ==========
    if (userId === requestedByUserId) {
      const isCurrentPasswordValid = await AuthConfig.comparePassword(
        passwordData.current_password,
        user.password_hash
      );
      
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedError('Contraseña actual incorrecta');
      }
    }

    // ========== Generar nueva contraseña hash ==========
    const newPasswordHash = await AuthConfig.hashPassword(passwordData.new_password);

    // ========== Actualizar contraseña ==========
    await this.usuarioRepository.update(userId, {
      password_hash: newPasswordHash
    });

    // ========== Registrar cambio de contraseña para auditoría ==========
    await this.usuarioRepository.trackPasswordChange(userId);
  }

  private async validateChangePermissions(
    targetUserId: string,
    requestedByUserId: string,
    requestedByUserRole: UserRole,
    targetUserRole: UserRole
  ): Promise<void> {
    
    // El usuario siempre puede cambiar su propia contraseña
    if (targetUserId === requestedByUserId) {
      return;
    }

    // Validaciones para cambio de contraseña de otros usuarios
    switch (requestedByUserRole) {
      case 'super_admin':
        // Super admin puede cambiar contraseña de cualquier usuario
        return;

      case 'admin':
        // Admin puede cambiar contraseña de usuarios no-admin
        if (['super_admin', 'admin'].includes(targetUserRole)) {
          throw new ValidationError(
            'No tienes permisos para cambiar la contraseña de administradores',
            'rol'
          );
        }
        return;

      case 'manager':
        // Manager puede cambiar contraseña de usuarios básicos
        if (!['viewer', 'supervisor'].includes(targetUserRole)) {
          throw new ValidationError(
            'Solo puedes cambiar la contraseña de usuarios Visualizador o Supervisor',
            'rol'
          );
        }
        return;

      case 'supervisor':
      case 'viewer':
        // Estos roles solo pueden cambiar su propia contraseña
        throw new ValidationError(
          'No tienes permisos para cambiar la contraseña de otros usuarios',
          'rol'
        );

      default:
        throw new ValidationError('Rol no autorizado para esta operación', 'rol');
    }
  }

  private async validatePasswordData(passwordData: ChangePasswordDTO, isSelfChange: boolean): Promise<void> {
    // Validar que las contraseñas coinciden
    if (passwordData.new_password !== passwordData.confirm_password) {
      throw new ValidationError(
        'Las contraseñas no coinciden',
        'confirm_password'
      );
    }

    // Validar nueva contraseña
    if (!validatePassword(passwordData.new_password)) {
      throw new ValidationError(
        'La nueva contraseña debe tener al menos 8 caracteres, una letra y un número',
        'new_password'
      );
    }

    // Validar contraseña actual solo para auto-cambio
    if (isSelfChange) {
      if (!passwordData.current_password) {
        throw new ValidationError(
          'La contraseña actual es requerida',
          'current_password'
        );
      }

      // Verificar que la nueva contraseña sea diferente a la actual
      if (passwordData.current_password === passwordData.new_password) {
        throw new ValidationError(
          'La nueva contraseña debe ser diferente a la actual',
          'new_password'
        );
      }
    }

    // Validaciones adicionales de seguridad
    await this.validatePasswordSecurity(passwordData.new_password);
  }

  private async validatePasswordSecurity(newPassword: string): Promise<void> {
    // Lista de contraseñas comunes prohibidas
    const commonPasswords = [
      'password', '123456', 'password123', 'admin123', 'qwerty',
      'letmein', 'welcome', 'monkey', 'dragon', 'password1',
      '123456789', '12345678', 'sunshine', 'iloveyou', 'princess'
    ];

    if (commonPasswords.includes(newPassword.toLowerCase())) {
      throw new ValidationError(
        'La contraseña es demasiado común. Elige una más segura',
        'new_password'
      );
    }

    // Verificar que no contenga solo números
    if (/^\d+$/.test(newPassword)) {
      throw new ValidationError(
        'La contraseña no puede contener solo números',
        'new_password'
      );
    }

    // Verificar que no contenga solo letras
    if (/^[a-zA-Z]+$/.test(newPassword)) {
      throw new ValidationError(
        'La contraseña debe contener al menos un número',
        'new_password'
      );
    }

    // Verificar longitud mínima y máxima
    if (newPassword.length < 8) {
      throw new ValidationError(
        'La contraseña debe tener al menos 8 caracteres',
        'new_password'
      );
    }

    if (newPassword.length > 128) {
      throw new ValidationError(
        'La contraseña no puede exceder 128 caracteres',
        'new_password'
      );
    }

    // Verificar complejidad mejorada
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (complexityScore < 3) {
      throw new ValidationError(
        'La contraseña debe contener al menos 3 de los siguientes: mayúsculas, minúsculas, números, caracteres especiales',
        'new_password'
      );
    }
  }
}

// ========== Use Case para Reset de Contraseña (Admin) ==========

export class ResetPasswordUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(
    userId: string,
    newPassword: string,
    resetByUserId: string,
    resetByUserRole: UserRole
  ): Promise<string> {
    
    // ========== Validar que el usuario existe ==========
    const user = await this.usuarioRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    // ========== Validar permisos ==========
    await this.validateResetPermissions(resetByUserRole, user.rol);

    // ========== Generar contraseña temporal si no se proporciona ==========
    const passwordToSet = newPassword || this.generateTemporaryPassword();

    // ========== Validar nueva contraseña ==========
    if (!validatePassword(passwordToSet)) {
      throw new ValidationError(
        'La contraseña debe tener al menos 8 caracteres, una letra y un número',
        'password'
      );
    }

    // ========== Generar hash y actualizar ==========
    const passwordHash = await AuthConfig.hashPassword(passwordToSet);
    
    await this.usuarioRepository.update(userId, {
      password_hash: passwordHash
    });

    // ========== Registrar reset para auditoría ==========
    await this.usuarioRepository.trackPasswordChange(userId);

    return passwordToSet;
  }

  private async validateResetPermissions(resetByUserRole: UserRole, targetUserRole: UserRole): Promise<void> {
    switch (resetByUserRole) {
      case 'super_admin':
        // Super admin puede resetear cualquier contraseña
        return;

      case 'admin':
        // Admin puede resetear contraseñas excepto de otros admins
        if (['super_admin', 'admin'].includes(targetUserRole)) {
          throw new ValidationError(
            'No tienes permisos para resetear contraseñas de administradores',
            'rol'
          );
        }
        return;

      default:
        throw new ValidationError(
          'No tienes permisos para resetear contraseñas',
          'rol'
        );
    }
  }

  private generateTemporaryPassword(): string {
    // Generar contraseña temporal segura
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const numbers = '23456789';
    const special = '!@#$%';
    
    let password = '';
    
    // Asegurar al menos una mayúscula, una minúscula, un número y un carácter especial
    password += chars.charAt(Math.floor(Math.random() * 26)); // Mayúscula
    password += chars.charAt(Math.floor(Math.random() * 26) + 26); // Minúscula
    password += numbers.charAt(Math.floor(Math.random() * numbers.length)); // Número
    password += special.charAt(Math.floor(Math.random() * special.length)); // Especial
    
    // Completar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      const allChars = chars + numbers + special;
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}