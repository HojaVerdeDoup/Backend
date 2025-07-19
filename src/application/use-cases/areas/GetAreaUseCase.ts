// ================================================
// FILE: src/application/use-cases/areas/GetAreaUseCase.ts
// ================================================

import { IAreaRepository } from '../../../domain/repositories/IAreaRepository';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '../../../domain/repositories/ISucursalRepository';
import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { AreaResponseDTO } from '../../dtos/AreaDTO';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetAreaUseCase {
  constructor(
    private areaRepository: IAreaRepository,
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository,
    private departamentoRepository: IDepartamentoRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(id: string): Promise<AreaResponseDTO> {
    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new NotFoundError('Área no encontrada');
    }

    // Obtener información adicional
    const empresa = await this.empresaRepository.findById(area.empresa_id);
    const sucursal = await this.sucursalRepository.findById(area.sucursal_id);
    const departamento = await this.departamentoRepository.findById(area.departamento_id);
    let responsable = null;

    if (area.responsable_id) {
      responsable = await this.usuarioRepository.findById(area.responsable_id);
    }

    return {
      id: area.id,
      empresa_id: area.empresa_id,
      empresa_nombre: empresa?.nombre,
      sucursal_id: area.sucursal_id,
      sucursal_nombre: sucursal?.nombre,
      sucursal_codigo: sucursal?.codigo,
      departamento_id: area.departamento_id,
      departamento_nombre: departamento?.nombre,
      departamento_codigo: departamento?.codigo,
      nombre: area.nombre,
      codigo: area.codigo,
      descripcion: area.descripcion,
      responsable_id: area.responsable_id,
      responsable_nombre: responsable ? `${responsable.nombres} ${responsable.apellidos}` : undefined,
      horario_entrada: area.horario_entrada,
      horario_salida: area.horario_salida,
      tolerancia_entrada: area.tolerancia_entrada,
      tolerancia_salida: area.tolerancia_salida,
      dias_laborables: area.dias_laborables,
      ubicacion_fisica: area.ubicacion_fisica,
      capacidad_maxima: area.capacidad_maxima,
      activo: area.activo,
      created_at: area.created_at,
      updated_at: area.updated_at
    };
  }
}
