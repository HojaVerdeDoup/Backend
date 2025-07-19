
// ================================================
// FILE: src/application/use-cases/departamentos/GetDepartamentoJerarquiaUseCase.ts
// ================================================

import { IDepartamentoRepository } from '../../../domain/repositories/IDepartamentoRepository';
import { DepartamentoJerarquiaDTO } from '../../dtos/DepartamentoDTO';

export class GetDepartamentoJerarquiaUseCase {
  constructor(private departamentoRepository: IDepartamentoRepository) {}

  async execute(empresaId?: string): Promise<DepartamentoJerarquiaDTO[]> {
    const jerarquia = await this.departamentoRepository.findJerarquia(empresaId);

    // Convertir a estructura jerárquica con hijos
    const jerarquiaMap = new Map<string, DepartamentoJerarquiaDTO>();
    const raiz: DepartamentoJerarquiaDTO[] = [];

    // Crear todos los nodos
    jerarquia.forEach(item => {
      const nodo: DepartamentoJerarquiaDTO = {
        id: item.id,
        empresa_id: item.empresa_id,
        nombre: item.nombre,
        codigo: item.codigo,
        nivel: item.nivel,
        departamento_padre_id: item.departamento_padre_id,
        responsable_id: item.responsable_id,
        responsable_nombre: item.responsable_nombre,
        ruta_completa: item.ruta_completa,
        ruta_codigos: item.ruta_codigos,
        profundidad: item.profundidad,
        subdepartamentos_count: item.subdepartamentos_count,
        areas_count: item.areas_count,
        usuarios_count: item.usuarios_count,
        hijos: []
      };
      jerarquiaMap.set(item.id, nodo);
    });

    // Construir jerarquía
    jerarquia.forEach(item => {
      const nodo = jerarquiaMap.get(item.id)!;
      if (item.departamento_padre_id) {
        const padre = jerarquiaMap.get(item.departamento_padre_id);
        if (padre) {
          padre.hijos!.push(nodo);
        }
      } else {
        raiz.push(nodo);
      }
    });

    return raiz;
  }
}
