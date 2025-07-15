// Ruta: src/application/use-cases/empresas/UpdateEmpresaUseCase.ts

import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { UpdateEmpresaDTO, EmpresaResponseDTO } from '@/application/dtos/EmpresaDTO';
import { Empresa } from '@/domain/entities/Empresa';
import { NotFoundError } from '@/shared/errors/AppError';

export class UpdateEmpresaUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(id: string, updateData: UpdateEmpresaDTO): Promise<EmpresaResponseDTO> {
    // Verificar que la empresa existe
    const existingEmpresa = await this.empresaRepository.findById(id);
    if (!existingEmpresa) {
      throw new NotFoundError('Empresa');
    }

    // Preparar datos para actualizar - mapear correctamente a tipos de Empresa
    const dataToUpdate: Partial<Empresa> = {};
    
    if (updateData.nombre !== undefined) {
      dataToUpdate.nombre = updateData.nombre.trim();
    }
    if (updateData.direccion !== undefined) {
      // Convertir null a undefined para compatibilidad con Empresa
      dataToUpdate.direccion = updateData.direccion?.trim() || undefined;
    }
    if (updateData.telefono !== undefined) {
      // Convertir null a undefined para compatibilidad con Empresa
      dataToUpdate.telefono = updateData.telefono?.replace(/\D/g, '') || undefined;
    }
    if (updateData.email !== undefined) {
      // Convertir null a undefined para compatibilidad con Empresa
      dataToUpdate.email = updateData.email?.toLowerCase().trim() || undefined;
    }
    if (updateData.logo_url !== undefined) {
      // Convertir null a undefined para compatibilidad con Empresa
      dataToUpdate.logo_url = updateData.logo_url?.trim() || undefined;
    }
    if (updateData.activo !== undefined) {
      dataToUpdate.activo = updateData.activo;
    }

    // Actualizar empresa
    const updatedEmpresa = await this.empresaRepository.update(id, dataToUpdate);

    return {
      id: updatedEmpresa.id,
      nombre: updatedEmpresa.nombre,
      ruc: updatedEmpresa.ruc,
      ruc_formatted: `${updatedEmpresa.ruc.substring(0, 2)}-${updatedEmpresa.ruc.substring(2, 10)}-${updatedEmpresa.ruc.substring(10)}`,
      direccion: updatedEmpresa.direccion,
      telefono: updatedEmpresa.telefono,
      email: updatedEmpresa.email,
      logo_url: updatedEmpresa.logo_url,
      activo: updatedEmpresa.activo,
      created_at: updatedEmpresa.created_at,
      updated_at: updatedEmpresa.updated_at
    };
  }
}