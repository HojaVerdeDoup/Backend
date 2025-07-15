//Ruta: src/presentation/validators/sucursalValidator.ts

import { body, query, param, ValidationChain } from 'express-validator';

export const createSucursalValidator: ValidationChain[] = [
  body('empresa_id')
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  body('nombre')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\-&]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),

  body('codigo')
    .isLength({ min: 2, max: 10 })
    .withMessage('Código debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Za-z0-9\-]+$/)
    .withMessage('Código solo puede contener letras, números y guiones'),

  body('direccion')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Dirección no puede exceder 255 caracteres'),

  body('telefono')
    .optional()
    .matches(/^[\d\s\-\(\)]+$/)
    .withMessage('Teléfono contiene caracteres inválidos')
    .isLength({ min: 7, max: 15 })
    .withMessage('Teléfono debe tener entre 7 y 15 dígitos'),

  body('ciudad')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ciudad debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]+$/)
    .withMessage('Ciudad contiene caracteres inválidos')
];

export const updateSucursalValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  body('nombre')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\-&]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),

  body('codigo')
    .optional()
    .isLength({ min: 2, max: 10 })
    .withMessage('Código debe tener entre 2 y 10 caracteres')
    .matches(/^[A-Za-z0-9\-]+$/)
    .withMessage('Código solo puede contener letras, números y guiones'),

  body('direccion')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Dirección no puede exceder 255 caracteres'),

  body('telefono')
    .optional()
    .matches(/^[\d\s\-\(\)]+$/)
    .withMessage('Teléfono contiene caracteres inválidos')
    .isLength({ min: 7, max: 15 })
    .withMessage('Teléfono debe tener entre 7 y 15 dígitos'),

  body('ciudad')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Ciudad debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.\-]+$/)
    .withMessage('Ciudad contiene caracteres inválidos'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso')
];

export const getSucursalValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const deleteSucursalValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const listSucursalesValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser entre 1 y 100'),

  query('empresa_id')
    .optional()
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  query('nombre')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre para filtrar debe tener máximo 100 caracteres'),

  query('codigo')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Código para filtrar debe tener máximo 10 caracteres'),

  query('ciudad')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Ciudad para filtrar debe tener máximo 100 caracteres'),

  query('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso')
];