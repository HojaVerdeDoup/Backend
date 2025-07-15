import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { AuthConfig } from '@/infrastructure/config/auth';
import { CreateUsuarioDTO, AuthResponseDTO, UsuarioResponseDTO } from '@/application/dtos/UsuarioDTO';
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

    // Mapear respuesta
    const userResponse: UsuarioResponseDTO = {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      sucursal_id: usuario.sucursal_id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      nombre_completo: `${usuario.nombres} ${usuario.apellidos}`,
      rol: usuario.rol,
      activo: usuario.activo,
      ultimo_login: usuario.ultimo_login,
      created_at: usuario.created_at,
      updated_at: usuario.updated_at
    };

    return {
      user: userResponse,
      token,
      refreshToken,
      expiresIn: '7d'
    };
  }
}