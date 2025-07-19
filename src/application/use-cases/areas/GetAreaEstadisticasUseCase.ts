// Ruta: src/application/use-cases/areas/GetAreaEstadisticasUseCase.ts

import { IAreaRepository, AreaFilters, AreaEstadisticas } from '../../../domain/repositories/IAreaRepository';

export class GetAreaEstadisticasUseCase {
  constructor(private areaRepository: IAreaRepository) {}

  async execute(filters?: AreaFilters): Promise<AreaEstadisticas[]> {
    return this.areaRepository.getEstadisticas(filters);
  }
}