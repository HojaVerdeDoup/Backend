
// ================================================
// CORRECCIÓN: src/application/use-cases/departamentos/UpdateDepartamentoUseCase.ts
// ================================================

import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { UpdateDepartamentoDTO, DepartamentoResponseDTO } from '../../dtos/DepartamentoDTO';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';
import { GetDepartamentoUseCase } from './GetDepartamentoUseCase'; // AGREGAR ESTE IMPORT

export class UpdateDepartamentoUseCase {
  constructor(
    private departamentoRepository: IDepartamentoRepository,
    private empresaRepository: IEmpresaRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(id: string, updateData: UpdateDepartamentoDTO): Promise<DepartamentoResponseDTO> {
    // Verificar que el departamento existe
    const departamentoExists = await this.departamentoRepository.exists(id);
    if (!departamentoExists) {
      throw new NotFoundError('Departamento no encontrado');
    }

    const departamento = await this.departamentoRepository.findById(id);
    if (!departamento) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // Validar código único si se está actualizando
    if (updateData.codigo) {
      const codeExists = await this.departamentoRepository.existsByCode(
        updateData.codigo,
        departamento.empresa_id,
        id
      );
      if (codeExists) {
        throw new ValidationError('Ya existe un departamento con este código en la empresa');
      }
    }

    // Validar departamento padre si se está actualizando
    if (updateData.departamento_padre_id !== undefined) {
      if (updateData.departamento_padre_id) {
        const padreExists = await this.departamentoRepository.exists(updateData.departamento_padre_id);
        if (!padreExists) {
          throw new NotFoundError('Departamento padre no encontrado');
        }

        // Validar jerarquía
        const jerarquiaValida = await this.departamentoRepository.validateJerarquia(
          id,
          updateData.departamento_padre_id
        );
        if (!jerarquiaValida) {
          throw new ValidationError('La jerarquía de departamentos resultante sería inválida');
        }
      }
    }

    // Validar responsable si se está actualizando
    if (updateData.responsable_id !== undefined) {
      if (updateData.responsable_id) {
        const responsable = await this.usuarioRepository.findById(updateData.responsable_id);
        if (!responsable) {
          throw new NotFoundError('Usuario responsable no encontrado');
        }

        if (responsable.empresa_id !== departamento.empresa_id) {
          throw new ValidationError('El responsable debe pertenecer a la misma empresa');
        }

        if (!['admin', 'manager', 'supervisor'].includes(responsable.rol)) {
          throw new ValidationError('El responsable debe tener rol de admin, manager o supervisor');
        }
      }
    }

    // Preparar datos para actualización
    const dataToUpdate: any = {};
    if (updateData.nombre !== undefined) dataToUpdate.nombre = updateData.nombre.trim();
    if (updateData.codigo !== undefined) dataToUpdate.codigo = updateData.codigo.toUpperCase();
    if (updateData.descripcion !== undefined) dataToUpdate.descripcion = updateData.descripcion?.trim();
    if (updateData.departamento_padre_id !== undefined) dataToUpdate.departamento_padre_id = updateData.departamento_padre_id;
    if (updateData.responsable_id !== undefined) dataToUpdate.responsable_id = updateData.responsable_id;
    if (updateData.activo !== undefined) dataToUpdate.activo = updateData.activo;

    // Actualizar el departamento
    const updatedDepartamento = await this.departamentoRepository.update(id, dataToUpdate);

    // Retornar respuesta completa usando GetDepartamentoUseCase
    const getDepartamentoUseCase = new GetDepartamentoUseCase(
      this.departamentoRepository,
      this.empresaRepository,
      this.usuarioRepository
    );

    return getDepartamentoUseCase.execute(updatedDepartamento.id);
  }
}