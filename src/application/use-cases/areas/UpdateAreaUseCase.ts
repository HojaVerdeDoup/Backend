// ================================================
// CORRECCIÓN: src/application/use-cases/areas/UpdateAreaUseCase.ts
// ================================================

import { IAreaRepository } from '../../../domain/repositories/IAreaRepository';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '../../../domain/repositories/ISucursalRepository';
import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UpdateAreaDTO, AreaResponseDTO } from '../../dtos/AreaDTO';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { GetAreaUseCase } from './GetAreaUseCase'; // AGREGAR ESTE IMPORT

export class UpdateAreaUseCase {
  constructor(
    private areaRepository: IAreaRepository,
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository,
    private departamentoRepository: IDepartamentoRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(id: string, updateData: UpdateAreaDTO): Promise<AreaResponseDTO> {
    // Verificar que el área existe
    const areaExists = await this.areaRepository.exists(id);
    if (!areaExists) {
      throw new NotFoundError('Área no encontrada');
    }

    const area = await this.areaRepository.findById(id);
    if (!area) {
      throw new NotFoundError('Área no encontrada');
    }

    // Validar código único si se está actualizando
    if (updateData.codigo) {
      const codeExists = await this.areaRepository.existsByCode(
        updateData.codigo,
        area.sucursal_id,
        id
      );
      if (codeExists) {
        throw new ValidationError('Ya existe un área con este código en la sucursal');
      }
    }

    // Validar responsable si se está actualizando
    if (updateData.responsable_id !== undefined) {
      if (updateData.responsable_id) {
        const responsable = await this.usuarioRepository.findById(updateData.responsable_id);
        if (!responsable) {
          throw new NotFoundError('Usuario responsable no encontrado');
        }

        if (responsable.empresa_id !== area.empresa_id) {
          throw new ValidationError('El responsable debe pertenecer a la misma empresa');
        }

        if (!['admin', 'manager', 'supervisor'].includes(responsable.rol)) {
          throw new ValidationError('El responsable debe tener rol de admin, manager o supervisor');
        }
      }
    }

    // Validar horarios
    if (updateData.horario_entrada && updateData.horario_salida) {
      if (updateData.horario_entrada >= updateData.horario_salida) {
        throw new ValidationError('La hora de entrada debe ser anterior a la hora de salida');
      }
    } else if (updateData.horario_entrada && !updateData.horario_salida) {
      if (updateData.horario_entrada >= area.horario_salida) {
        throw new ValidationError('La hora de entrada debe ser anterior a la hora de salida');
      }
    } else if (!updateData.horario_entrada && updateData.horario_salida) {
      if (area.horario_entrada >= updateData.horario_salida) {
        throw new ValidationError('La hora de entrada debe ser anterior a la hora de salida');
      }
    }

    // Validar tolerancias
    if (updateData.tolerancia_entrada !== undefined && (updateData.tolerancia_entrada < 0 || updateData.tolerancia_entrada > 120)) {
      throw new ValidationError('La tolerancia de entrada debe estar entre 0 y 120 minutos');
    }

    if (updateData.tolerancia_salida !== undefined && (updateData.tolerancia_salida < 0 || updateData.tolerancia_salida > 120)) {
      throw new ValidationError('La tolerancia de salida debe estar entre 0 y 120 minutos');
    }

    // Preparar datos para actualización
    const dataToUpdate: any = {};
    if (updateData.nombre !== undefined) dataToUpdate.nombre = updateData.nombre.trim();
    if (updateData.codigo !== undefined) dataToUpdate.codigo = updateData.codigo.toUpperCase();
    if (updateData.descripcion !== undefined) dataToUpdate.descripcion = updateData.descripcion?.trim();
    if (updateData.responsable_id !== undefined) dataToUpdate.responsable_id = updateData.responsable_id;
    if (updateData.horario_entrada !== undefined) dataToUpdate.horario_entrada = updateData.horario_entrada;
    if (updateData.horario_salida !== undefined) dataToUpdate.horario_salida = updateData.horario_salida;
    if (updateData.tolerancia_entrada !== undefined) dataToUpdate.tolerancia_entrada = updateData.tolerancia_entrada;
    if (updateData.tolerancia_salida !== undefined) dataToUpdate.tolerancia_salida = updateData.tolerancia_salida;
    if (updateData.dias_laborables !== undefined) dataToUpdate.dias_laborables = updateData.dias_laborables;
    if (updateData.ubicacion_fisica !== undefined) dataToUpdate.ubicacion_fisica = updateData.ubicacion_fisica?.trim();
    if (updateData.capacidad_maxima !== undefined) dataToUpdate.capacidad_maxima = updateData.capacidad_maxima;
    if (updateData.activo !== undefined) dataToUpdate.activo = updateData.activo;

    // Actualizar el área
    const updatedArea = await this.areaRepository.update(id, dataToUpdate);

    // Retornar respuesta completa usando GetAreaUseCase
    const getAreaUseCase = new GetAreaUseCase(
      this.areaRepository,
      this.empresaRepository,
      this.sucursalRepository,
      this.departamentoRepository,
      this.usuarioRepository
    );

    return getAreaUseCase.execute(updatedArea.id);
  }
}
