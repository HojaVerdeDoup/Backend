// Ruta: src/application/use-cases/auth/RegisterUseCase.ts (ACTUALIZAR ARCHIVO EXISTENTE)

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { AuthConfig } from '@/infrastructure/config/auth';
import { CreateUsuarioDTO, AuthResponseDTO, UsuarioProfileDTO, getUserRoleDescription, getUserPermissions } from '@/application/dtos/UsuarioDTO';
import { ValidationError } from '@/shared/errors/AppError';
import { validateEmail, validatePassword } from '@/shared/utils/validators';

export class RegisterUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(userData: CreateUsuarioDTO): Promise<AuthResponseDTO> {
    // Validaciones
    if (!validateEmail(userData.email)) {
      throw new ValidationError('Email inválido', 'email');
    }

    if (!validatePassword(userData.password)) {
      throw new ValidationError('Password debe tener al menos 8 caracteres, una letra y un número', 'password');
    }

    // Verificar que el email no existe
    const existingUser = await this.usuarioRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new ValidationError('El email ya está registrado', 'email');
    }

    // Hash de la contraseña
    const passwordHash = await AuthConfig.hashPassword(userData.password);

    // Crear usuario
    const usuario = await this.usuarioRepository.create({
      empresa_id: userData.empresa_id,
      sucursal_id: userData.sucursal_id,
      email: userData.email,
      password_hash: passwordHash,
      nombres: userData.nombres,
      apellidos: userData.apellidos,
      rol: userData.rol,
      telefono: userData.telefono?.replace(/\D/g, '') || undefined,
      cedula: userData.cedula?.replace(/\D/g, '') || undefined,
      direccion: userData.direccion?.trim(),
      fecha_nacimiento: userData.fecha_nacimiento ? new Date(userData.fecha_nacimiento) : undefined,
      activo: true
    });

    // Crear payload JWT
    const payload = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresaId: usuario.empresa_id,
      sucursalId: usuario.sucursal_id
    };

    // Generar tokens
    const token = AuthConfig.generateToken(payload);
    const refreshToken = AuthConfig.generateRefreshToken(payload);

    // Obtener permisos del usuario
    const permisos = getUserPermissions(usuario.rol);

    // Mapear respuesta con UsuarioProfileDTO
    const userProfile: UsuarioProfileDTO = {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
      rol: usuario.rol,
      empresa_nombre: 'N/A', // Se obtendrá en implementación real
      sucursal_nombre: usuario.sucursal_id ? 'N/A' : undefined,
      telefono: usuario.telefono,
      direccion: usuario.direccion,
      fecha_nacimiento: usuario.fecha_nacimiento?.toISOString().split('T')[0],
      ultimo_login: usuario.ultimo_login,
      permisos
    };

    return {
      user: userProfile,
      token,
      refreshToken,
      expiresIn: '7d',
      permisos
    };
  }
}