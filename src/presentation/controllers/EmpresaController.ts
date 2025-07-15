//Ruta: src/presentation/controllers/EmpresaController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateEmpresaUseCase } from '@/application/use-cases/empresas/CreateEmpresaUseCase';
import { GetEmpresaUseCase } from '@/application/use-cases/empresas/GetEmpresaUseCase';
import { ListEmpresasUseCase } from '@/application/use-cases/empresas/ListEmpresasUseCase';
import { UpdateEmpresaUseCase } from '@/application/use-cases/empresas/UpdateEmpresaUseCase';
import { DeleteEmpresaUseCase } from '@/application/use-cases/empresas/DeleteEmpresaUseCase';
import { ApiResponse } from '@/shared/types/common';

interface AuthenticatedRequest extends Request {
  userRole?: string;
  empresaId?: string;
}

export class EmpresaController {
  constructor(
    private createEmpresaUseCase: CreateEmpresaUseCase,
    private getEmpresaUseCase: GetEmpresaUseCase,
    private listEmpresasUseCase: ListEmpresasUseCase,
    private updateEmpresaUseCase: UpdateEmpresaUseCase,
    private deleteEmpresaUseCase: DeleteEmpresaUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const empresaData = req.body;
      
      const result = await this.createEmpresaUseCase.execute(empresaData);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Empresa creada exitosamente'
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  get = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      const result = await this.getEmpresaUseCase.execute(id);
      
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
        nombre: req.query.nombre as string,
        ruc: req.query.ruc as string,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined
      };

      // Si no es super_admin, solo puede ver su empresa
      if (req.userRole !== 'super_admin' && req.empresaId) {
        // Para futuras implementaciones con filtro por empresa
      }
      
      const result = await this.listEmpresasUseCase.execute(filters);
      
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
      
      const result = await this.updateEmpresaUseCase.execute(id, updateData);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Empresa actualizada exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      
      await this.deleteEmpresaUseCase.execute(id);
      
      const response: ApiResponse<null> = {
        success: true,
        message: 'Empresa eliminada exitosamente'
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}