// Ruta: src/application/use-cases/departamentos/ListDepartamentosUseCase.ts

import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { DepartamentoFiltersDTO, DepartamentoListDTO } from '../../dtos/DepartamentoDTO';
import { PaginatedResponse } from '../../../shared/types/common';

export class ListDepartamentosUseCase {
  constructor(private departamentoRepository: IDepartamentoRepository) {}

  async execute(filters: DepartamentoFiltersDTO): Promise<PaginatedResponse<DepartamentoListDTO>> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 10, 100); // Máximo 100 por página

    // Usar la vista materializada de jerarquía para obtener datos enriquecidos
    const jerarquia = await this.departamentoRepository.findJerarquia(filters.empresa_id);

    // Filtrar según los criterios
    let filteredData = jerarquia;

    if (filters.nombre) {
      filteredData = filteredData.filter(d => 
        d.nombre.toLowerCase().includes(filters.nombre!.toLowerCase())
      );
    }

    if (filters.codigo) {
      filteredData = filteredData.filter(d => 
        d.codigo.toLowerCase().includes(filters.codigo!.toLowerCase())
      );
    }

    if (filters.departamento_padre_id) {
      filteredData = filteredData.filter(d => 
        d.departamento_padre_id === filters.departamento_padre_id
      );
    }

    if (filters.responsable_id) {
      filteredData = filteredData.filter(d => 
        d.responsable_id === filters.responsable_id
      );
    }

    if (filters.nivel) {
      filteredData = filteredData.filter(d => 
        d.nivel === filters.nivel
      );
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter(d => 
        d.nombre.toLowerCase().includes(searchTerm) ||
        d.codigo.toLowerCase().includes(searchTerm) ||
        d.ruta_completa.toLowerCase().includes(searchTerm)
      );
    }

    // Calcular paginación
    const total = filteredData.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedData = filteredData.slice(offset, offset + limit);

    // Mapear a DTO
    const mappedData: DepartamentoListDTO[] = paginatedData.map(d => ({
      id: d.id,
      empresa_id: d.empresa_id,
      empresa_nombre: d.empresa_nombre,
      nombre: d.nombre,
      codigo: d.codigo,
      nivel: d.nivel,
      ruta_completa: d.ruta_completa,
      responsable_nombre: d.responsable_nombre,
      subdepartamentos_count: d.subdepartamentos_count,
      areas_count: d.areas_count,
      usuarios_count: d.usuarios_count,
      activo: true, // Solo mostramos activos
      created_at: new Date() // Se obtendrá del resultado real
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
}