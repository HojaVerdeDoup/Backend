import { IUsuarioRepository } from '@/domain/repositories/IUsuarioRepository';
import { Usuario } from '@/domain/entities/Usuario';
import { supabase } from '@/infrastructure/config/database';
import { NotFoundError } from '@/shared/errors/AppError';

export class UsuarioRepository implements IUsuarioRepository {
  async create(usuario: Omit<Usuario, 'id' | 'created_at' | 'updated_at'>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert({
        empresa_id: usuario.empresa_id,
        sucursal_id: usuario.sucursal_id,
        email: usuario.email,
        password_hash: usuario.password_hash,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        activo: usuario.activo
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findById(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding user: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('activo', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding user by email: ${error.message}`);
    }

    return this.mapToEntity(data);
  }

  async findByEmpresa(empresaId: string): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('activo', true)
      .order('nombres', { ascending: true });

    if (error) {
      throw new Error(`Error finding users by empresa: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  async findBySucursal(sucursalId: string): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('sucursal_id', sucursalId)
      .eq('activo', true)
      .order('nombres', { ascending: true });

    if (error) {
      throw new Error(`Error finding users by sucursal: ${error.message}`);
    }

    return data.map(item => this.mapToEntity(item));
  }

  async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
    const { data: updatedData, error } = await supabase
      .from('usuarios')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }

    return this.mapToEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .update({ 
        ultimo_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Usuario {
    return {
      id: data.id,
      empresa_id: data.empresa_id,
      sucursal_id: data.sucursal_id,
      email: data.email,
      password_hash: data.password_hash,
      nombres: data.nombres,
      apellidos: data.apellidos,
      rol: data.rol,
      activo: data.activo,
      ultimo_login: data.ultimo_login ? new Date(data.ultimo_login) : undefined,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at)
    };
  }
}