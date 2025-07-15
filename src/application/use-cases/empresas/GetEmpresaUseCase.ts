//Ruta: src/application/use-cases/empresas/GetEmpresaUseCase.ts

import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { EmpresaResponseDTO } from '@/application/dtos/EmpresaDTO';
import { NotFoundError } from '@/shared/errors/AppError';

export class GetEmpresaUseCase {
  constructor(
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository
  ) {}

  async execute(id: string): Promise<EmpresaResponseDTO> {
    const empresa = await this.empresaRepository.findById(id);
    
    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    // Obtener total de sucursales
    const totalSucursales = await this.sucursalRepository.countByEmpresa(id);

    return {
      id: empresa.id,
      nombre: empresa.nombre,
      ruc: empresa.ruc,
      ruc_formatted: `${empresa.ruc.substring(0, 2)}-${empresa.ruc.substring(2, 10)}-${empresa.ruc.substring(10)}`,
      direccion: empresa.direccion,
      telefono: empresa.telefono,
      email: empresa.email,
      logo_url: empresa.logo_url,
      activo: empresa.activo,
      total_sucursales: totalSucursales,
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    };
  }
}