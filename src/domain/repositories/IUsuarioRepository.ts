import { Usuario } from '@/domain/entities/Usuario';

export interface IUsuarioRepository {
  create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findByEmpresa(empresaId: string): Promise<Usuario[]>;
  findBySucursal(sucursalId: string): Promise<Usuario[]>;
  update(id: string, data: Partial<Usuario>): Promise<Usuario>;
  delete(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
}