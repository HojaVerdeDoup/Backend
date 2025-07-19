// Ruta: src/presentation/validators/departamentoValidator.ts

import { body, param, query, ValidationChain } from 'express-validator';

export const createDepartamentoValidator: ValidationChain[] = [
  body('empresa_id')
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido')
    .notEmpty()
    .withMessage('ID de empresa es requerido'),

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

  body('departamento_padre_id')
    .optional()
    .isUUID()
    .withMessage('ID de departamento padre debe ser un UUID válido'),

  body('responsable_id')
    .optional()
    .isUUID()
    .withMessage('ID de responsable debe ser un UUID válido')
];

export const updateDepartamentoValidator: ValidationChain[] = [
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

  body('departamento_padre_id')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return true;
      }
      throw new Error('ID de departamento padre debe ser un UUID válido o null');
    }),

  body('responsable_id')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true;
      if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return true;
      }
      throw new Error('ID de responsable debe ser un UUID válido o null');
    }),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser un valor booleano')
];

export const getDepartamentoValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const deleteDepartamentoValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const listDepartamentosValidator: ValidationChain[] = [
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

  query('departamento_padre_id')
    .optional()
    .isUUID()
    .withMessage('ID de departamento padre debe ser un UUID válido'),

  query('responsable_id')
    .optional()
    .isUUID()
    .withMessage('ID de responsable debe ser un UUID válido'),

  query('nivel')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Nivel debe ser un número entre 1 y 5'),

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

export const getJerarquiaValidator: ValidationChain[] = [
  query('empresa_id')
    .optional()
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido')
];

export const validateJerarquiaValidator: ValidationChain[] = [
  query('departamento_id')
    .isUUID()
    .withMessage('ID de departamento debe ser un UUID válido'),

  query('padre_id')
    .optional()
    .isUUID()
    .withMessage('ID de padre debe ser un UUID válido')
];

export const getPosiblesPadresValidator: ValidationChain[] = [
  query('empresa_id')
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  query('departamento_id')
    .optional()
    .isUUID()
    .withMessage('ID de departamento debe ser un UUID válido')
];