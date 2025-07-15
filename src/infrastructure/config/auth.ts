import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from './environment';

export interface JWTPayload {
  userId: string;
  email: string;
  rol: string;
  empresaId: string;
  sucursalId?: string;
}

export class AuthConfig {
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '7d', // Hardcodeado para evitar problemas de tipos
      issuer: 'sistema-asistencia',
      audience: 'sistema-asistencia-users'
    });
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: '30d', // Hardcodeado para evitar problemas de tipos
      issuer: 'sistema-asistencia',
      audience: 'sistema-asistencia-refresh'
    });
  }

  static verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      return decoded as JWTPayload;
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret);
      return decoded as JWTPayload;
    } catch (error) {
      throw new Error('Refresh token inválido');
    }
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}