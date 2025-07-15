//Ruta: src/application/use-cases/sucursales/GetSucursalUseCase.ts

import { ISucursalRepository } from '@/domain/repositories/ISucursalRepository';
import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { SucursalResponseDTO } from '@/application/dtos/SucursalDTO';
import { NotFoundError } from '@/shared/errors/AppError';

export class GetSucursalUseCase {
  constructor(
    private sucursalRepository: ISucursalRepository,
    private empresaRepository: IEmpresaRepository
  ) {}

  async execute(id: string): Promise<SucursalResponseDTO> {
    const sucursal = await this.sucursalRepository.findById(id);
    
    if (!sucursal) {
      throw new NotFoundError('Sucursal');
    }

    // Obtener información de la empresa
    const empresa = await this.empresaRepository.findById(sucursal.empresa_id);
    
    // TODO: Obtener total de empleados cuando se implemente
    const totalEmpleados = 0;

    return {
      id: sucursal.id,
      empresa_id: sucursal.empresa_id,
      empresa_nombre: empresa?.nombre || 'N/A',
      nombre: sucursal.nombre,
      codigo: sucursal.codigo,
      direccion: sucursal.direccion,
      telefono: sucursal.telefono,
      ciudad: sucursal.ciudad,
      nombre_completo: sucursal.ciudad ? `${sucursal.nombre} - ${sucursal.ciudad}` : sucursal.nombre,
      activo: sucursal.activo,
      total_empleados: totalEmpleados,
      created_at: sucursal.created_at,
      updated_at: sucursal.updated_at
    };
  }
}