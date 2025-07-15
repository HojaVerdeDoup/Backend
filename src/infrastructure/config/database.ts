import { createClient } from '@supabase/supabase-js';
import { config } from './environment';

if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  }
);

// Test de conexión
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.error('Error de conexión a Supabase:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error de conexión:', error);
    return false;
  }
};