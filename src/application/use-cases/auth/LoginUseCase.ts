// Ruta: src/application/use-cases/auth/LoginUseCase.ts (ACTUALIZAR ARCHIVO EXISTENTE)

import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { AuthConfig, JWTPayload } from '@/infrastructure/config/auth';
import { LoginDTO, AuthResponseDTO, UsuarioProfileDTO, getUserRoleDescription, getUserPermissions } from '@/application/dtos/UsuarioDTO';
import { UnauthorizedError } from '@/shared/errors/AppError';

export class LoginUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(loginData: LoginDTO): Promise<AuthResponseDTO> {
    // Buscar usuario por email
    const usuario = await this.usuarioRepository.findByEmail(loginData.email);
    
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new UnauthorizedError('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await AuthConfig.comparePassword(
      loginData.password,
      usuario.password_hash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    // Crear payload JWT
    const payload: JWTPayload = {
      userId: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      empresaId: usuario.empresa_id,
      sucursalId: usuario.sucursal_id
    };

    // Generar tokens
    const token = AuthConfig.generateToken(payload);
    const refreshToken = AuthConfig.generateRefreshToken(payload);

    // Actualizar último login
    await this.usuarioRepository.updateLastLogin(usuario.id);

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