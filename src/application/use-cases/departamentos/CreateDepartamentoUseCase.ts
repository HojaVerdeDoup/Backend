// Ruta: src/application/use-cases/departamentos/CreateDepartamentoUseCase.ts

import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { CreateDepartamentoDTO, DepartamentoResponseDTO } from '../../dtos/DepartamentoDTO';
import { NotFoundError, ValidationError } from '../../../shared/errors/AppError';

export class CreateDepartamentoUseCase {
  constructor(
    private departamentoRepository: IDepartamentoRepository,
    private empresaRepository: IEmpresaRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(createData: CreateDepartamentoDTO): Promise<DepartamentoResponseDTO> {
    // Validar que la empresa existe
    const empresaExists = await this.empresaRepository.exists(createData.empresa_id);
    if (!empresaExists) {
      throw new NotFoundError('Empresa no encontrada');
    }

    // Validar que el código no existe en la empresa
    const codeExists = await this.departamentoRepository.existsByCode(
      createData.codigo,
      createData.empresa_id
    );
    if (codeExists) {
      throw new ValidationError('Ya existe un departamento con este código en la empresa');
    }

    // Validar departamento padre si se especifica
    if (createData.departamento_padre_id) {
      const padreExists = await this.departamentoRepository.exists(createData.departamento_padre_id);
      if (!padreExists) {
        throw new NotFoundError('Departamento padre no encontrado');
      }

      // Validar que no se creen ciclos en la jerarquía
      const jerarquiaValida = await this.departamentoRepository.validateJerarquia(
        '', // ID temporal, se validará en el repository
        createData.departamento_padre_id
      );
      if (!jerarquiaValida) {
        throw new ValidationError('La jerarquía de departamentos resultante sería inválida');
      }
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

    // Crear el departamento
    const departamento = await this.departamentoRepository.create({
      empresa_id: createData.empresa_id,
      nombre: createData.nombre.trim(),
      codigo: createData.codigo.toUpperCase(),
      descripcion: createData.descripcion?.trim(),
      departamento_padre_id: createData.departamento_padre_id,
      responsable_id: createData.responsable_id,
      nivel: 1, // Se calculará automáticamente en el repository
      activo: true
    });

    // Obtener información adicional para la respuesta
    const empresa = await this.empresaRepository.findById(departamento.empresa_id);
    let departamentoPadre = null;
    let responsable = null;

    if (departamento.departamento_padre_id) {
      departamentoPadre = await this.departamentoRepository.findById(departamento.departamento_padre_id);
    }

    if (departamento.responsable_id) {
      responsable = await this.usuarioRepository.findById(departamento.responsable_id);
    }

    return {
      id: departamento.id,
      empresa_id: departamento.empresa_id,
      empresa_nombre: empresa?.nombre,
      nombre: departamento.nombre,
      codigo: departamento.codigo,
      descripcion: departamento.descripcion,
      departamento_padre_id: departamento.departamento_padre_id,
      departamento_padre_nombre: departamentoPadre?.nombre,
      responsable_id: departamento.responsable_id,
      responsable_nombre: responsable ? `${responsable.nombres} ${responsable.apellidos}` : undefined,
      nivel: departamento.nivel,
      activo: departamento.activo,
      subdepartamentos_count: 0,
      areas_count: 0,
      usuarios_count: 0,
      created_at: departamento.created_at,
      updated_at: departamento.updated_at
    };
  }
}