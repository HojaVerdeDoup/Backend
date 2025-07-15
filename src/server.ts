import app from './app';
import { config } from './infrastructure/config/environment';
import { testConnection } from '@/infrastructure/config/database';

const startServer = async (): Promise<void> => {
  try {
    // Probar conexión a la base de datos
    console.log('🔗 Probando conexión a Supabase...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Error: No se pudo conectar a Supabase');
      process.exit(1);
    }
    
    console.log('✅ Conexión a Supabase exitosa');

    // Iniciar servidor
    const server = app.listen(config.port, () => {
      console.log(`🚀 Servidor iniciado en puerto ${config.port}`);
      console.log(`📝 Entorno: ${config.nodeEnv}`);
      console.log(`🌐 URL: ${config.apiUrl}`);
      console.log(`📖 Health Check: ${config.apiUrl}/health`);
      console.log(`🔐 Auth endpoints: ${config.apiUrl}/api/auth`);
    });

    // Manejo graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();