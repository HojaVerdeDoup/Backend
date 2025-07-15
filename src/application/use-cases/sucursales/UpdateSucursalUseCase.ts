// Ruta: src/application/use-cases/sucursales/UpdateSucursalUseCase.ts

import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { UpdateSucursalDTO, SucursalResponseDTO } from '@/application/dtos/SucursalDTO';
import { Sucursal } from '@/domain/entities/Sucursal';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

export class UpdateSucursalUseCase {
  constructor(private sucursalRepository: ISucursalRepository) {}

  async execute(id: string, updateData: UpdateSucursalDTO): Promise<SucursalResponseDTO> {
    // Verificar que la sucursal existe
    const existingSucursal = await this.sucursalRepository.findById(id);
    if (!existingSucursal) {
      throw new NotFoundError('Sucursal');
    }

    // Si se está actualizando el código, verificar que no existe en la empresa
    if (updateData.codigo && updateData.codigo !== existingSucursal.codigo) {
      const codeExists = await this.sucursalRepository.existsByCode(
        updateData.codigo,
        existingSucursal.empresa_id,
        id
      );
      if (codeExists) {
        throw new ValidationError('El código de sucursal ya existe en esta empresa', 'codigo');
      }
    }

    // Preparar datos para actualizar - mapear correctamente a tipos de Sucursal
    const dataToUpdate: Partial<Sucursal> = {};
    
    if (updateData.nombre !== undefined) {
      dataToUpdate.nombre = updateData.nombre.trim();
    }
    if (updateData.codigo !== undefined) {
      dataToUpdate.codigo = updateData.codigo.toUpperCase().trim();
    }
    if (updateData.direccion !== undefined) {
      // Convertir null a undefined para compatibilidad con Sucursal
      dataToUpdate.direccion = updateData.direccion?.trim() || undefined;
    }
    if (updateData.telefono !== undefined) {
      // Convertir null a undefined para compatibilidad con Sucursal
      dataToUpdate.telefono = updateData.telefono?.replace(/\D/g, '') || undefined;
    }
    if (updateData.ciudad !== undefined) {
      // Convertir null a undefined para compatibilidad con Sucursal
      dataToUpdate.ciudad = updateData.ciudad?.trim() || undefined;
    }
    if (updateData.activo !== undefined) {
      dataToUpdate.activo = updateData.activo;
    }

    // Actualizar sucursal
    const updatedSucursal = await this.sucursalRepository.update(id, dataToUpdate);

    return {
      id: updatedSucursal.id,
      empresa_id: updatedSucursal.empresa_id,
      nombre: updatedSucursal.nombre,
      codigo: updatedSucursal.codigo,
      direccion: updatedSucursal.direccion,
      telefono: updatedSucursal.telefono,
      ciudad: updatedSucursal.ciudad,
      nombre_completo: updatedSucursal.ciudad ? `${updatedSucursal.nombre} - ${updatedSucursal.ciudad}` : updatedSucursal.nombre,
      activo: updatedSucursal.activo,
      created_at: updatedSucursal.created_at,
      updated_at: updatedSucursal.updated_at
    };
  }
}