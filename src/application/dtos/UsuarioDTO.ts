import { UserRole } from '@/shared/types/common';

export interface CreateUsuarioDTO {
  empresa_id: string;
  sucursal_id?: string;
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  rol: UserRole;
}

export interface UpdateUsuarioDTO {
  nombres?: string;
  apellidos?: string;
  email?: string;
  rol?: UserRole;
  sucursal_id?: string;
  activo?: boolean;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UsuarioResponseDTO {
  id: string;
  empresa_id: string;
  sucursal_id?: string;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  rol: UserRole;
  activo: boolean;
  ultimo_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponseDTO {
  user: UsuarioResponseDTO;
  token: string;
  refreshToken: string;
  expiresIn: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}