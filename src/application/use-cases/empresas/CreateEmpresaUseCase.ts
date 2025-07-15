//Ruta: src/application/use-cases/empresas/CreateEmpresaUseCase.ts

import { IEmpresaRepository } from '@/domain/repositories/IEmpresaRepository';
import { CreateEmpresaDTO, EmpresaResponseDTO } from '@/application/dtos/EmpresaDTO';
import { ValidationError } from '@/shared/errors/AppError';

export class CreateEmpresaUseCase {
  constructor(private empresaRepository: IEmpresaRepository) {}

  async execute(empresaData: CreateEmpresaDTO): Promise<EmpresaResponseDTO> {
    // Validar que el RUC no existe
    const existingEmpresa = await this.empresaRepository.findByRuc(empresaData.ruc);
    if (existingEmpresa) {
      throw new ValidationError('El RUC ya está registrado', 'ruc');
    }

    // Crear empresa
    const empresa = await this.empresaRepository.create({
      nombre: empresaData.nombre.trim(),
      ruc: empresaData.ruc.replace(/\D/g, ''), // Solo números
      direccion: empresaData.direccion?.trim(),
      telefono: empresaData.telefono?.replace(/\D/g, ''), // Solo números
      email: empresaData.email?.toLowerCase().trim(),
      logo_url: empresaData.logo_url?.trim(),
      activo: true
    });

    // Mapear respuesta
    return {
      id: empresa.id,
      nombre: empresa.nombre,
      ruc: empresa.ruc,
      ruc_formatted: `${empresa.ruc.substring(0, 2)}-${empresa.ruc.substring(2, 10)}-${empresa.ruc.substring(10)}`,
      direccion: empresa.direccion,
      telefono: empresa.telefono,
      email: empresa.email,
      logo_url: empresa.logo_url,
      activo: empresa.activo,
      total_sucursales: 0,
      created_at: empresa.created_at,
      updated_at: empresa.updated_at
    };
  }
}