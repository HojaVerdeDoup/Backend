// Ruta: src/application/use-cases/areas/ListAreasUseCase.ts

import { IAreaRepository } from '../../../domain/repositories/IAreaRepository';
import { AreaFiltersDTO, AreaListDTO } from '../../dtos/AreaDTO';
import { PaginatedResponse } from '../../../shared/types/common';

export class ListAreasUseCase {
  constructor(private areaRepository: IAreaRepository) {}

  async execute(filters: AreaFiltersDTO): Promise<PaginatedResponse<AreaListDTO>> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Máximo 100 por página

    // Usar la vista materializada de estadísticas para obtener datos enriquecidos
    const estadisticas = await this.areaRepository.getEstadisticas({
      empresa_id: filters.empresa_id,
      sucursal_id: filters.sucursal_id,
      departamento_id: filters.departamento_id
    });

    // Filtrar según los criterios
    let filteredData = estadisticas;

    if (filters.nombre) {
      filteredData = filteredData.filter(a => 
        a.nombre.toLowerCase().includes(filters.nombre!.toLowerCase())
      );
    }

    if (filters.codigo) {
      filteredData = filteredData.filter(a => 
        a.codigo.toLowerCase().includes(filters.codigo!.toLowerCase())
      );
    }

    if (filters.responsable_id) {
      // Necesitaríamos obtener el responsable_id desde la vista, 
      // por ahora usar el filtro básico del repository
      return this.executeBasicFilter(filters);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(a => 
        a.nombre.toLowerCase().includes(searchTerm) ||
        a.codigo.toLowerCase().includes(searchTerm) ||
        a.empresa_nombre.toLowerCase().includes(searchTerm) ||
        a.sucursal_nombre.toLowerCase().includes(searchTerm) ||
        a.departamento_nombre.toLowerCase().includes(searchTerm)
      );
    }

    // Calcular paginación
    const total = filteredData.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Mapear a DTO
    const mappedData: AreaListDTO[] = paginatedData.map(a => ({
      id: a.id,
      empresa_id: a.empresa_id,
      empresa_nombre: a.empresa_nombre,
      sucursal_id: a.sucursal_id,
      sucursal_nombre: a.sucursal_nombre,
      sucursal_codigo: a.sucursal_codigo,
      departamento_id: a.departamento_id,
      departamento_nombre: a.departamento_nombre,
      departamento_codigo: a.departamento_codigo,
      nombre: a.nombre,
      codigo: a.codigo,
      responsable_nombre: a.responsable_nombre,
      horario_entrada: a.horario_entrada,
      horario_salida: a.horario_salida,
      capacidad_maxima: a.capacidad_maxima,
      usuarios_count: a.usuarios_count,
      activo: a.activo,
      created_at: a.created_at
    }));

    return {
      data: mappedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  private async executeBasicFilter(filters: AreaFiltersDTO): Promise<PaginatedResponse<AreaListDTO>> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100);

    const result = await this.areaRepository.findAll(
      { page, limit },
      {
        empresa_id: filters.empresa_id,
        sucursal_id: filters.sucursal_id,
        departamento_id: filters.departamento_id,
        nombre: filters.nombre,
        codigo: filters.codigo,
        responsable_id: filters.responsable_id,
        activo: filters.activo
      }
    );

    // Para el filtro básico, necesitaríamos hacer JOIN manualmente
    // o usar el repository con datos expandidos
    const mappedData: AreaListDTO[] = result.data.map(a => ({
      id: a.id,
      empresa_id: a.empresa_id,
      empresa_nombre: 'N/A', // Se obtendrá del JOIN en implementación real
      sucursal_id: a.sucursal_id,
      sucursal_nombre: 'N/A',
      sucursal_codigo: 'N/A',
      departamento_id: a.departamento_id,
      departamento_nombre: 'N/A',
      departamento_codigo: 'N/A',
      nombre: a.nombre,
      codigo: a.codigo,
      responsable_nombre: 'N/A',
      horario_entrada: a.horario_entrada,
      horario_salida: a.horario_salida,
      capacidad_maxima: a.capacidad_maxima,
      usuarios_count: 0, // Se calculará en el repository
      activo: a.activo,
      created_at: a.created_at
    }));

    return {
      data: mappedData,
      pagination: result.pagination
    };
  }
}