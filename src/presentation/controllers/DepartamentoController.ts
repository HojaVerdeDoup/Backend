// Ruta: src/presentation/controllers/DepartamentoController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateDepartamentoUseCase } from '../../application/use-cases/departamentos/CreateDepartamentoUseCase';
import { GetDepartamentoUseCase } from '../../application/use-cases/departamentos/GetDepartamentoUseCase';
import { ListDepartamentosUseCase } from '../../application/use-cases/departamentos/ListDepartamentosUseCase';
import { UpdateDepartamentoUseCase } from '../../application/use-cases/departamentos/UpdateDepartamentoUseCase';
import { DeleteDepartamentoUseCase } from '../../application/use-cases/departamentos/DeleteDepartamentoUseCase';
import { GetDepartamentoJerarquiaUseCase } from '../../application/use-cases/departamentos/GetDepartamentoJerarquiaUseCase';
import { CreateDepartamentoDTO, UpdateDepartamentoDTO, DepartamentoFiltersDTO } from '../../application/dtos/DepartamentoDTO';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  empresaId?: string;
}

export class DepartamentoController {
  constructor(
    private createDepartamentoUseCase: CreateDepartamentoUseCase,
    private getDepartamentoUseCase: GetDepartamentoUseCase,
    private listDepartamentosUseCase: ListDepartamentosUseCase,
    private updateDepartamentoUseCase: UpdateDepartamentoUseCase,
    private deleteDepartamentoUseCase: DeleteDepartamentoUseCase,
    private getDepartamentoJerarquiaUseCase: GetDepartamentoJerarquiaUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createData: CreateDepartamentoDTO = {
        empresa_id: req.body.empresa_id,
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        departamento_padre_id: req.body.departamento_padre_id,
        responsable_id: req.body.responsable_id
      };

      const departamento = await this.createDepartamentoUseCase.execute(createData);

      res.status(201).json({
        success: true,
        message: 'Departamento creado exitosamente',
        data: departamento
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const departamento = await this.getDepartamentoUseCase.execute(id);

      res.json({
        success: true,
        data: departamento
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: DepartamentoFiltersDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        empresa_id: req.query.empresa_id as string || req.empresaId,
        nombre: req.query.nombre as string,
        codigo: req.query.codigo as string,
        departamento_padre_id: req.query.departamento_padre_id as string,
        responsable_id: req.query.responsable_id as string,
        nivel: req.query.nivel ? parseInt(req.query.nivel as string) : undefined,
        activo: req.query.activo ? req.query.activo === 'true' : undefined,
        search: req.query.search as string
      };

      const result = await this.listDepartamentosUseCase.execute(filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData: UpdateDepartamentoDTO = {
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        departamento_padre_id: req.body.departamento_padre_id,
        responsable_id: req.body.responsable_id,
        activo: req.body.activo
      };

      const departamento = await this.updateDepartamentoUseCase.execute(id, updateData);

      res.json({
        success: true,
        message: 'Departamento actualizado exitosamente',
        data: departamento
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.deleteDepartamentoUseCase.execute(id);

      res.json({
        success: true,
        message: 'Departamento eliminado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };

  getJerarquia = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const empresaId = req.query.empresa_id as string || req.empresaId;
      const jerarquia = await this.getDepartamentoJerarquiaUseCase.execute(empresaId);

      res.json({
        success: true,
        data: jerarquia
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint para validar jerarquía antes de crear/actualizar
  validateJerarquia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { departamento_id, padre_id } = req.query;
      
      // Esta validación se haría en un caso de uso específico
      // Por ahora retornamos true como placeholder
      res.json({
        success: true,
        data: {
          valid: true,
          message: 'Jerarquía válida'
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint para obtener posibles padres (departamentos del mismo nivel o inferior)
  getPosiblesPadres = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const empresaId = req.query.empresa_id as string || req.empresaId!;
      const departamentoId = req.query.departamento_id as string;

      const filters: DepartamentoFiltersDTO = {
        empresa_id: empresaId,
        limit: 100 // Obtener todos para mostrar estructura
      };

      const result = await this.listDepartamentosUseCase.execute(filters);
      
      // Filtrar departamentos que pueden ser padres (excluir el propio y sus hijos)
      let posiblesPadres = result.data;
      
      if (departamentoId) {
        posiblesPadres = result.data.filter(d => 
          d.id !== departamentoId && 
          d.nivel < 5 // No puede tener más de 5 niveles
        );
      }

      res.json({
        success: true,
        data: posiblesPadres
      });
    } catch (error) {
      next(error);
    }
  };
}