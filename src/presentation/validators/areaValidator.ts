// Ruta: src/presentation/validators/areaValidator.ts

import { body, param, query, ValidationChain } from 'express-validator';

// Validador personalizado para horarios
const timeFormatValidator = (value: string) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
  return timeRegex.test(value);
};

// Validador para días laborables
const diasLaborablesValidator = (value: any) => {
  if (!value || typeof value !== 'object') return false;
  
  const requiredDays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
  
  for (const day of requiredDays) {
    if (!(day in value) || typeof value[day] !== 'boolean') {
      return false;
    }
  }
  
  return true;
};

export const createAreaValidator: ValidationChain[] = [
  body('empresa_id')
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido')
    .notEmpty()
    .withMessage('ID de empresa es requerido'),

  body('sucursal_id')
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido')
    .notEmpty()
    .withMessage('ID de sucursal es requerido'),

  body('departamento_id')
    .isUUID()
    .withMessage('ID de departamento debe ser un UUID válido')
    .notEmpty()
    .withMessage('ID de departamento es requerido'),

  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .notEmpty()
    .withMessage('Nombre es requerido'),

  body('codigo')
    .trim()
    .matches(/^[A-Z0-9]{2,10}$/)
    .withMessage('Código debe tener entre 2-10 caracteres alfanuméricos en mayúsculas')
    .notEmpty()
    .withMessage('Código es requerido'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),

  body('responsable_id')
    .optional()
    .isUUID()
    .withMessage('ID de responsable debe ser un UUID válido'),

  body('horario_entrada')
    .optional()
    .custom(timeFormatValidator)
    .withMessage('Horario de entrada debe tener formato HH:MM:SS válido'),

  body('horario_salida')
    .optional()
    .custom(timeFormatValidator)
    .withMessage('Horario de salida debe tener formato HH:MM:SS válido'),

  body('tolerancia_entrada')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Tolerancia de entrada debe ser entre 0 y 120 minutos'),

  body('tolerancia_salida')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Tolerancia de salida debe ser entre 0 y 120 minutos'),

  body('dias_laborables')
    .optional()
    .custom(diasLaborablesValidator)
    .withMessage('Días laborables debe contener todos los días de la semana con valores booleanos'),

  body('ubicacion_fisica')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Ubicación física no puede exceder 200 caracteres'),

  body('capacidad_maxima')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidad máxima debe ser un número entero mayor a 0'),

  // Validación personalizada para horarios
  body().custom((body) => {
    if (body.horario_entrada && body.horario_salida) {
      if (body.horario_entrada >= body.horario_salida) {
        throw new Error('Horario de entrada debe ser anterior al horario de salida');
      }
    }
    return true;
  })
];

export const updateAreaValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres'),

  body('codigo')
    .optional()
    .trim()
    .matches(/^[A-Z0-9]{2,10}$/)
    .withMessage('Código debe tener entre 2-10 caracteres alfanuméricos en mayúsculas'),

  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Descripción no puede exceder 500 caracteres'),

  body('responsable_id')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return true;
      }
      throw new Error('ID de responsable debe ser un UUID válido o null');
    }),

  body('horario_entrada')
    .optional()
    .custom(timeFormatValidator)
    .withMessage('Horario de entrada debe tener formato HH:MM:SS válido'),

  body('horario_salida')
    .optional()
    .custom(timeFormatValidator)
    .withMessage('Horario de salida debe tener formato HH:MM:SS válido'),

  body('tolerancia_entrada')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Tolerancia de entrada debe ser entre 0 y 120 minutos'),

  body('tolerancia_salida')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('Tolerancia de salida debe ser entre 0 y 120 minutos'),

  body('dias_laborables')
    .optional()
    .custom(diasLaborablesValidator)
    .withMessage('Días laborables debe contener todos los días de la semana con valores booleanos'),

  body('ubicacion_fisica')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Ubicación física no puede exceder 200 caracteres'),

  body('capacidad_maxima')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      return Number.isInteger(Number(value)) && Number(value) > 0;
    })
    .withMessage('Capacidad máxima debe ser un número entero mayor a 0 o null'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser un valor booleano'),

  // Validación personalizada para horarios
  body().custom((body) => {
    if (body.horario_entrada && body.horario_salida) {
      if (body.horario_entrada >= body.horario_salida) {
        throw new Error('Horario de entrada debe ser anterior al horario de salida');
      }
    }
    return true;
  })
];

export const getAreaValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const deleteAreaValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const listAreasValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número entero mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser un número entre 1 y 100'),

  query('empresa_id')
    .optional()
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  query('sucursal_id')
    .optional()
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),

  query('departamento_id')
    .optional()
    .isUUID()
    .withMessage('ID de departamento debe ser un UUID válido'),

  query('nombre')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Filtro de nombre no puede exceder 100 caracteres'),

  query('codigo')
    .optional()
    .trim()
    .isLength({ max: 10 })
    .withMessage('Filtro de código no puede exceder 10 caracteres'),

  query('responsable_id')
    .optional()
    .isUUID()
    .withMessage('ID de responsable debe ser un UUID válido'),

  query('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser un valor booleano'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Búsqueda no puede exceder 100 caracteres')
];

export const getBySucursalValidator: ValidationChain[] = [
  param('sucursalId')
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido')
];

export const getByDepartamentoValidator: ValidationChain[] = [
  param('departamentoId')
    .isUUID()
    .withMessage('ID de departamento debe ser un UUID válido')
];


export const copyHorariosValidator: ValidationChain[] = [
  body('sourceAreaId')
    .isUUID()
    .withMessage('ID de área origen debe ser un UUID válido')
    .notEmpty()
    .withMessage('ID de área origen es requerido'),

  body('targetAreaIds')
    .isArray({ min: 1 })
    .withMessage('Debe especificar al menos un área destino'),

  body('targetAreaIds.*')
    .isUUID()
    .withMessage('Cada ID de área destino debe ser un UUID válido')
];

export const getEstadisticasValidator: ValidationChain[] = [
  query('empresa_id')
    .optional()
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  query('sucursal_id')
    .optional()
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),

  query('departamento_id')
    .optional()
    .isUUID()
    .withMessage('ID de departamento debe ser un UUID válido')
];