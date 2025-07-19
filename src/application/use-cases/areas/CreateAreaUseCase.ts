// Ruta: src/application/use-cases/areas/CreateAreaUseCase.ts

import { IAreaRepository } from '../../../domain/repositories/IAreaRepository';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository';
import { ISucursalRepository } from '../../../domain/repositories/ISucursalRepository';
import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { CreateAreaDTO, AreaResponseDTO } from '../../dtos/AreaDTO';
import { DiaLaborable } from '../../../domain/entities/Area';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class CreateAreaUseCase {
  constructor(
    private areaRepository: IAreaRepository,
    private empresaRepository: IEmpresaRepository,
    private sucursalRepository: ISucursalRepository,
    private departamentoRepository: IDepartamentoRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(createData: CreateAreaDTO): Promise<AreaResponseDTO> {
    // Validar que la empresa existe
    const empresaExists = await this.empresaRepository.exists(createData.empresa_id);
    if (!empresaExists) {
      throw new NotFoundError('Empresa no encontrada');
    }

    // Validar que la sucursal existe
    const sucursalExists = await this.sucursalRepository.exists(createData.sucursal_id);
    if (!sucursalExists) {
      throw new NotFoundError('Sucursal no encontrada');
    }

    // Validar que el departamento existe
    const departamentoExists = await this.departamentoRepository.exists(createData.departamento_id);
    if (!departamentoExists) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // Validar consistencia de empresas
    const empresaConsistente = await this.areaRepository.validateEmpresaConsistency(
      createData.empresa_id,
      createData.sucursal_id,
      createData.departamento_id
    );
    if (!empresaConsistente) {
      throw new ValidationError('La empresa, sucursal y departamento deben ser consistentes');
    }

    // Validar que el código no existe en la sucursal
    const codeExists = await this.areaRepository.existsByCode(
      createData.codigo,
      createData.sucursal_id
    );
    if (codeExists) {
      throw new ValidationError('Ya existe un área con este código en la sucursal');
    }

    // Validar responsable si se especifica
    if (createData.responsable_id) {
      const responsable = await this.usuarioRepository.findById(createData.responsable_id);
      if (!responsable) {
        throw new NotFoundError('Usuario responsable no encontrado');
      }

      if (responsable.empresa_id !== createData.empresa_id) {
        throw new ValidationError('El responsable debe pertenecer a la misma empresa');
      }

      if (!['admin', 'manager', 'supervisor'].includes(responsable.rol)) {
        throw new ValidationError('El responsable debe tener rol de admin, manager o supervisor');
      }
    }

    // Validar horarios
    if (createData.horario_entrada && createData.horario_salida) {
      if (createData.horario_entrada >= createData.horario_salida) {
        throw new ValidationError('La hora de entrada debe ser anterior a la hora de salida');
      }
    }

    // Validar tolerancias
    if (createData.tolerancia_entrada && (createData.tolerancia_entrada < 0 || createData.tolerancia_entrada > 120)) {
      throw new ValidationError('La tolerancia de entrada debe estar entre 0 y 120 minutos');
    }

    if (createData.tolerancia_salida && (createData.tolerancia_salida < 0 || createData.tolerancia_salida > 120)) {
      throw new ValidationError('La tolerancia de salida debe estar entre 0 y 120 minutos');
    }

    // Preparar días laborables con defaults
    const diasLaborablesDefault: DiaLaborable = {
      lunes: true,
      martes: true,
      miercoles: true,
      jueves: true,
      viernes: true,
      sabado: false,
      domingo: false
    };

    const diasLaborables: DiaLaborable = {
      ...diasLaborablesDefault,
      ...createData.dias_laborables
    };

    // Crear el área
    const area = await this.areaRepository.create({
      empresa_id: createData.empresa_id,
      sucursal_id: createData.sucursal_id,
      departamento_id: createData.departamento_id,
      nombre: createData.nombre.trim(),
      codigo: createData.codigo.toUpperCase(),
      descripcion: createData.descripcion?.trim(),
      responsable_id: createData.responsable_id,
      horario_entrada: createData.horario_entrada || '08:00:00',
      horario_salida: createData.horario_salida || '17:00:00',
      tolerancia_entrada: createData.tolerancia_entrada || 15,
      tolerancia_salida: createData.tolerancia_salida || 15,
      dias_laborables: diasLaborables,
      ubicacion_fisica: createData.ubicacion_fisica?.trim(),
      capacidad_maxima: createData.capacidad_maxima,
      activo: true
    });

    // Obtener información adicional para la respuesta
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
      usuarios_count: 0,
      activo: area.activo,
      created_at: area.created_at,
      updated_at: area.updated_at
    };
  }
}