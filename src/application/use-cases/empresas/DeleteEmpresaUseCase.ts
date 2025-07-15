//Ruta: src/application/use-cases/empresas/DeleteEmpresaUseCase.ts

import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

export class DeleteEmpresaUseCase {
  constructor(
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository
  ) {}

  async execute(id: string): Promise<void> {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepository.findById(id);
    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    // Verificar que no tiene sucursales activas
    const totalSucursales = await this.sucursalRepository.countByEmpresa(id);
    if (totalSucursales > 0) {
      throw new ValidationError(
        'No se puede eliminar la empresa porque tiene sucursales asociadas',
        'empresa_id'
      );
    }

    // Soft delete de la empresa
    await this.empresaRepository.delete(id);
  }
}