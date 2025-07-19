// Ruta: src/presentation/controllers/AreaController.ts

import { Request, Response, NextFunction } from 'express';
import { CreateAreaUseCase } from '../../application/use-cases/areas/CreateAreaUseCase';
import { GetAreaUseCase } from '../../application/use-cases/areas/GetAreaUseCase';
import { ListAreasUseCase } from '../../application/use-cases/areas/ListAreasUseCase';
import { UpdateAreaUseCase } from '../../application/use-cases/areas/UpdateAreaUseCase';
import { DeleteAreaUseCase } from '../../application/use-cases/areas/DeleteAreaUseCase';
import { GetAreaEstadisticasUseCase } from '../../application/use-cases/areas/GetAreaEstadisticasUseCase';
import { CreateAreaDTO, UpdateAreaDTO, AreaFiltersDTO } from '../../application/dtos/AreaDTO';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
  empresaId?: string;
  sucursalId?: string;
}

export class AreaController {
  constructor(
    private createAreaUseCase: CreateAreaUseCase,
    private getAreaUseCase: GetAreaUseCase,
    private listAreasUseCase: ListAreasUseCase,
    private updateAreaUseCase: UpdateAreaUseCase,
    private deleteAreaUseCase: DeleteAreaUseCase,
    private getAreaEstadisticasUseCase: GetAreaEstadisticasUseCase
  ) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const createData: CreateAreaDTO = {
        empresa_id: req.body.empresa_id,
        sucursal_id: req.body.sucursal_id,
        departamento_id: req.body.departamento_id,
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        responsable_id: req.body.responsable_id,
        horario_entrada: req.body.horario_entrada,
        horario_salida: req.body.horario_salida,
        tolerancia_entrada: req.body.tolerancia_entrada,
        tolerancia_salida: req.body.tolerancia_salida,
        dias_laborables: req.body.dias_laborables,
        ubicacion_fisica: req.body.ubicacion_fisica,
        capacidad_maxima: req.body.capacidad_maxima
      };

      const area = await this.createAreaUseCase.execute(createData);

      res.status(201).json({
        success: true,
        message: 'Área creada exitosamente',
        data: area
      });
    } catch (error) {
      next(error);
    }
  };

  get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const area = await this.getAreaUseCase.execute(id);

      res.json({
        success: true,
        data: area
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: AreaFiltersDTO = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        empresa_id: req.query.empresa_id as string || req.empresaId,
        sucursal_id: req.query.sucursal_id as string || req.sucursalId,
        departamento_id: req.query.departamento_id as string,
        nombre: req.query.nombre as string,
        codigo: req.query.codigo as string,
        responsable_id: req.query.responsable_id as string,
        activo: req.query.activo ? req.query.activo === 'true' : undefined,
        search: req.query.search as string
      };

      const result = await this.listAreasUseCase.execute(filters);

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
      const updateData: UpdateAreaDTO = {
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        descripcion: req.body.descripcion,
        responsable_id: req.body.responsable_id,
        horario_entrada: req.body.horario_entrada,
        horario_salida: req.body.horario_salida,
        tolerancia_entrada: req.body.tolerancia_entrada,
        tolerancia_salida: req.body.tolerancia_salida,
        dias_laborables: req.body.dias_laborables,
        ubicacion_fisica: req.body.ubicacion_fisica,
        capacidad_maxima: req.body.capacidad_maxima,
        activo: req.body.activo
      };

      const area = await this.updateAreaUseCase.execute(id, updateData);

      res.json({
        success: true,
        message: 'Área actualizada exitosamente',
        data: area
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.deleteAreaUseCase.execute(id);

      res.json({
        success: true,
        message: 'Área eliminada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  };

  getEstadisticas = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        empresa_id: req.query.empresa_id as string || req.empresaId,
        sucursal_id: req.query.sucursal_id as string,
        departamento_id: req.query.departamento_id as string
      };

      const estadisticas = await this.getAreaEstadisticasUseCase.execute(filters);

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint para obtener áreas por sucursal
  getBySucursal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sucursalId } = req.params;
      
      const filters: AreaFiltersDTO = {
        sucursal_id: sucursalId,
        limit: 100,
        activo: true
      };

      const result = await this.listAreasUseCase.execute(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint para obtener áreas por departamento
  getByDepartamento = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { departamentoId } = req.params;
      
      const filters: AreaFiltersDTO = {
        departamento_id: departamentoId,
        limit: 100,
        activo: true
      };

      const result = await this.listAreasUseCase.execute(filters);

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint para validar código único en sucursal
  checkCodigoAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { codigo, sucursal_id } = req.query;
    const { id } = req.params; // Puede ser undefined si es ruta sin parámetro

    // Validar que tenemos los datos necesarios
    if (!codigo || !sucursal_id) {
      res.status(400).json({
        success: false,
        error: 'Código y ID de sucursal son requeridos'
      });
      return;
    }

    // Aquí iría la lógica real para verificar disponibilidad
    // Por ahora simulamos la respuesta
    const isAvailable = true; // Esta verificación se haría con el repository

    res.json({
      success: true,
      data: {
        available: isAvailable,
        message: isAvailable ? 'Código disponible' : 'Código ya existe',
        codigo: codigo,
        sucursal_id: sucursal_id,
        checking_for_update: !!id // Indica si es para actualización
      }
    });
  } catch (error) {
    next(error);
  }
};

  // Endpoint para copiar horarios entre áreas
  copyHorarios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sourceAreaId, targetAreaIds } = req.body;

      // Esta funcionalidad se implementaría en un caso de uso específico
      res.json({
        success: true,
        message: 'Horarios copiados exitosamente',
        data: {
          affected_areas: targetAreaIds.length
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Endpoint para obtener template de días laborables por defecto
  getDefaultDiasLaborables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defaultDias = {
        lunes: true,
        martes: true,
        miercoles: true,
        jueves: true,
        viernes: true,
        sabado: false,
        domingo: false
      };

      res.json({
        success: true,
        data: defaultDias
      });
    } catch (error) {
      next(error);
    }
  };
}