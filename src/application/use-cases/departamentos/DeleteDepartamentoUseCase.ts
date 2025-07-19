// Ruta: src/application/use-cases/departamentos/DeleteDepartamentoUseCase.ts (ARCHIVO COMPLETO CORREGIDO)

import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class DeleteDepartamentoUseCase {
  constructor(private departamentoRepository: IDepartamentoRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que el departamento existe
    const departamentoExists = await this.departamentoRepository.exists(id);
    if (!departamentoExists) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // Verificar que no tenga subdepartamentos activos
    const subdepartamentos = await this.departamentoRepository.findChildren(id);
    if (subdepartamentos.length > 0) {
      throw new ValidationError('No se puede eliminar un departamento que tiene subdepartamentos');
    }

    // Verificar que no tenga áreas asociadas (esto se haría con el AreaRepository)
    // Por ahora asumimos que la validación se hace en el trigger de la base de datos

    // Eliminar (soft delete)
    await this.departamentoRepository.delete(id);
  }
}