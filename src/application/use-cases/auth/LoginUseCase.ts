import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { AuthConfig, JWTPayload } from '@/infrastructure/config/auth';
import { LoginDTO, AuthResponseDTO, UsuarioResponseDTO } from '@/application/dtos/UsuarioDTO';
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