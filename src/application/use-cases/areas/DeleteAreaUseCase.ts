
// Ruta: src/application/use-cases/areas/DeleteAreaUseCase.ts (ARCHIVO COMPLETO CORREGIDO)
import { IAreaRepository } from '../../../domain/repositories/IAreaRepository';
import { NotFoundError } from '../../../shared/errors/AppError';

export class DeleteAreaUseCase {
  constructor(private areaRepository: IAreaRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que el área existe
    const areaExists = await this.areaRepository.exists(id);
    if (!areaExists) {
      throw new NotFoundError('Área no encontrada');
    }

    // Verificar que no tenga usuarios asociados (esto se haría con el UsuarioRepository)
    // Por ahora asumimos que la validación se hace en el trigger de la base de datos

    // Eliminar (soft delete)
    await this.areaRepository.delete(id);
  }
}