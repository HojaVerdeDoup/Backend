//Ruta: src/application/use-cases/sucursales/CreateSucursalUseCase.ts

import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { CreateSucursalDTO, SucursalResponseDTO } from '@/application/dtos/SucursalDTO';
import { ValidationError, NotFoundError } from '@/shared/errors/AppError';

export class CreateSucursalUseCase {
  constructor(
    private sucursalRepository: ISucursalRepository,
    private empresaRepository: IEmpresaRepository
  ) {}

  async execute(sucursalData: CreateSucursalDTO): Promise<SucursalResponseDTO> {
    // Verificar que la empresa existe
    const empresa = await this.empresaRepository.findById(sucursalData.empresa_id);
    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    if (!empresa.activo) {
      throw new ValidationError('No se puede crear sucursal en empresa inactiva', 'empresa_id');
    }

    // Validar que el código no existe en la misma empresa
    const existingCode = await this.sucursalRepository.existsByCode(
      sucursalData.codigo,
      sucursalData.empresa_id
    );
    if (existingCode) {
      throw new ValidationError('El código de sucursal ya existe en esta empresa', 'codigo');
    }

    // Crear sucursal
    const sucursal = await this.sucursalRepository.create({
      empresa_id: sucursalData.empresa_id,
      nombre: sucursalData.nombre.trim(),
      codigo: sucursalData.codigo.toUpperCase().trim(),
      direccion: sucursalData.direccion?.trim(),
      telefono: sucursalData.telefono?.replace(/\D/g, ''), // Solo números
      ciudad: sucursalData.ciudad?.trim(),
      activo: true
    });

    return {
      id: sucursal.id,
      empresa_id: sucursal.empresa_id,
      empresa_nombre: empresa.nombre,
      nombre: sucursal.nombre,
      codigo: sucursal.codigo,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono,
      ciudad: sucursal.ciudad,
      nombre_completo: sucursal.ciudad ? `${sucursal.nombre} - ${sucursal.ciudad}` : sucursal.nombre,
      activo: sucursal.activo,
      total_empleados: 0,
      created_at: sucursal.created_at,
      updated_at: sucursal.updated_at
    };
  }
}