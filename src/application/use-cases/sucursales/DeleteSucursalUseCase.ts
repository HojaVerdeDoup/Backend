//Ruta: src/application/use-cases/sucursales/DeleteSucursalUseCase.ts

import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

export class DeleteSucursalUseCase {
  constructor(private sucursalRepository: ISucursalRepository) {}

  async execute(id: string): Promise<void> {
    // Verificar que la sucursal existe
    const sucursal = await this.sucursalRepository.findById(id);
    if (!sucursal) {
      throw new NotFoundError('Sucursal');
    }

    // TODO: Verificar que no tiene empleados activos cuando se implemente
    // const totalEmpleados = await this.empleadoRepository.countBySucursal(id);
    // if (totalEmpleados > 0) {
    //   throw new ValidationError(
    //     'No se puede eliminar la sucursal porque tiene empleados asociados',
    //     'sucursal_id'
    //   );
    // }

    // Soft delete de la sucursal
    await this.sucursalRepository.delete(id);
  }
}