// ================================================
// FILE: src/application/use-cases/departamentos/GetDepartamentoUseCase.ts
// ================================================

import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { IEmpresaRepository } from '../../../domain/repositories/IEmpresaRepository';
import { IUsuarioRepository } from '../../../domain/repositories/IUsuarioRepository';
import { DepartamentoResponseDTO } from '../../dtos/DepartamentoDTO';
import { NotFoundError } from '../../../shared/errors/AppError';

export class GetDepartamentoUseCase {
  constructor(
    private departamentoRepository: IDepartamentoRepository,
    private empresaRepository: IEmpresaRepository,
    private usuarioRepository: IUsuarioRepository
  ) {}

  async execute(id: string): Promise<DepartamentoResponseDTO> {
    const departamento = await this.departamentoRepository.findById(id);
    if (!departamento) {
      throw new NotFoundError('Departamento no encontrado');
    }

    // Obtener información adicional
    const empresa = await this.empresaRepository.findById(departamento.empresa_id);
    let departamentoPadre = null;
    let responsable = null;

    if (departamento.departamento_padre_id) {
      departamentoPadre = await this.departamentoRepository.findById(departamento.departamento_padre_id);
    }

    if (departamento.responsable_id) {
      responsable = await this.usuarioRepository.findById(departamento.responsable_id);
    }

    // Obtener ruta completa
    const rutaCompleta = await this.departamentoRepository.obtenerRutaCompleta(departamento.id);

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
      ruta_completa: rutaCompleta,
      activo: departamento.activo,
      created_at: departamento.created_at,
      updated_at: departamento.updated_at
    };
  }
}
