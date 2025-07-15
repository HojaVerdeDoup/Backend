import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { AuthConfig, JWTPayload } from '@/infrastructure/config/auth';
import { RefreshTokenDTO } from '@/application/dtos/UsuarioDTO';
import { UnauthorizedError } from '@/shared/errors/AppError';

export class RefreshTokenUseCase {
  constructor(private usuarioRepository: IUsuarioRepository) {}

  async execute(data: RefreshTokenDTO): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verificar refresh token
      const payload = AuthConfig.verifyRefreshToken(data.refreshToken);
      // Verificar que el usuario aún existe y está activo
      const usuario = await this.usuarioRepository.findById(payload.userId);
      
      if (!usuario || !usuario.activo) {
        throw new UnauthorizedError('Usuario no encontrado o inactivo');
      }

      // Crear nuevo payload con datos actualizados
      const newPayload: JWTPayload = {
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        empresaId: usuario.empresa_id,
        sucursalId: usuario.sucursal_id
      };

      // Generar nuevos tokens
      const newToken = AuthConfig.generateToken(newPayload);
      const newRefreshToken = AuthConfig.generateRefreshToken(newPayload);

      return {
        token: newToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new UnauthorizedError('Refresh token inválido');
    }
  }
}