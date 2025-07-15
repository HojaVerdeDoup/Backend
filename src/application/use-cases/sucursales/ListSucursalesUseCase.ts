//Ruta: src/application/use-cases/sucursales/ListSucursalesUseCase.ts

import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { SucursalFiltersDTO, SucursalListDTO } from '@/application/dtos/SucursalDTO';
import { PaginatedResponse } from '@/shared/types/common';

export class ListSucursalesUseCase {
  constructor(private sucursalRepository: ISucursalRepository) {}

  async execute(filters: SucursalFiltersDTO): Promise<PaginatedResponse<SucursalListDTO>> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Máximo 100 por página

    const result = await this.sucursalRepository.findAll(
      { page, limit },
      {
        empresa_id: filters.empresa_id,
        nombre: filters.nombre,
        codigo: filters.codigo,
        ciudad: filters.ciudad,
        activo: filters.activo
      }
    );

    // TODO: En la implementación real del repository, se debe hacer JOIN con empresas
    // para obtener el nombre de la empresa y total de empleados
    const mappedData = result.data.map(sucursal => ({
      id: sucursal.id,
      empresa_id: sucursal.empresa_id,
      empresa_nombre: 'N/A', // Se obtendrá del JOIN en el repository
      nombre: sucursal.nombre,
      codigo: sucursal.codigo,
      ciudad: sucursal.ciudad,
      nombre_completo: sucursal.ciudad ? `${sucursal.nombre} - ${sucursal.ciudad}` : sucursal.nombre,
      activo: sucursal.activo,
      total_empleados: 0, // Se calculará en el repository si es necesario
      created_at: sucursal.created_at
    }));

    return {
      data: mappedData,
      pagination: result.pagination
    };
  }
}