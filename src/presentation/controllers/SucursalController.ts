//Ruta: src/presentation/controllers/SucursalController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateSucursalUseCase } from '@/application/use-cases/sucursales/CreateSucursalUseCase';
import { GetSucursalUseCase } from '@/application/use-cases/sucursales/GetSucursalUseCase';
import { ListSucursalesUseCase } from '@/application/use-cases/sucursales/ListSucursalesUseCase';
import { UpdateSucursalUseCase } from '@/application/use-cases/sucursales/UpdateSucursalUseCase';
import { DeleteSucursalUseCase } from '@/application/use-cases/sucursales/DeleteSucursalUseCase';
import { ApiResponse } from '@/shared/types/common';

interface AuthenticatedRequest extends Request {
  userRole?: string;
  empresaId?: string;
  sucursalId?: string;
}

export class SucursalController {
  constructor(
    private createSucursalUseCase: CreateSucursalUseCase,
    private getSucursalUseCase: GetSucursalUseCase,
    private listSucursalesUseCase: ListSucursalesUseCase,
    private updateSucursalUseCase: UpdateSucursalUseCase,
    private deleteSucursalUseCase: DeleteSucursalUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const sucursalData = req.body;

      // Si no es super_admin, forzar empresa del usuario
      if (req.userRole !== 'super_admin' && req.empresaId) {
        sucursalData.empresa_id = req.empresaId;
      }
      
      const result = await this.createSucursalUseCase.execute(sucursalData);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Sucursal creada exitosamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const result = await this.getSucursalUseCase.execute(id);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        empresa_id: req.query.empresa_id as string,
        nombre: req.query.nombre as string,
        codigo: req.query.codigo as string,
        ciudad: req.query.ciudad as string,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      };

      // Si no es super_admin, solo puede ver sucursales de su empresa
      if (req.userRole !== 'super_admin' && req.empresaId) {
        filters.empresa_id = req.empresaId;
      }
      
      const result = await this.listSucursalesUseCase.execute(filters);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = await this.updateSucursalUseCase.execute(id, updateData);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Sucursal actualizada exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.deleteSucursalUseCase.execute(id);
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Sucursal eliminada exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}