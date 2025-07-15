//Ruta: src/application/use-cases/empresas/ListEmpresasUseCase.ts

import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { EmpresaFiltersDTO, EmpresaListDTO } from '@/application/dtos/EmpresaDTO';
import { PaginatedResponse } from '@/shared/types/common';

export class ListEmpresasUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(filters: EmpresaFiltersDTO): Promise<PaginatedResponse<EmpresaListDTO>> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Máximo 100 por página

    const result = await this.empresaRepository.findAll(
      { page, limit },
      {
        nombre: filters.nombre,
        ruc: filters.ruc,
        activo: filters.activo
      }
    );

    // Mapear respuesta
    const mappedData = result.data.map(empresa => ({
      id: empresa.id,
      nombre: empresa.nombre,
      ruc: empresa.ruc,
      ruc_formatted: `${empresa.ruc.substring(0, 2)}-${empresa.ruc.substring(2, 10)}-${empresa.ruc.substring(10)}`,
      telefono: empresa.telefono,
      email: empresa.email,
      activo: empresa.activo,
      total_sucursales: 0, // Se calculará en el repository si es necesario
      created_at: empresa.created_at
    }));

    return {
      data: mappedData,
      pagination: result.pagination
    };
  }
}