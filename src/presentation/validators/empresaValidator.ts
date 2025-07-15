//Ruta: src/presentation/validators/empresaValidator.ts

import { body, query, param, ValidationChain } from 'express-validator';

export const createEmpresaValidator: ValidationChain[] = [
  body('nombre')
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombre debe tener entre 2 y 150 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\-&]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),

  body('ruc')
    .isLength({ min: 13, max: 13 })
    .withMessage('RUC debe tener exactamente 13 dígitos')
    .isNumeric()
    .withMessage('RUC solo puede contener números')
    .custom((value) => {
      // Validación básica de RUC ecuatoriano
      const provincia = parseInt(value.substring(0, 2));
      if (provincia < 1 || provincia > 24) {
        throw new Error('RUC inválido: código de provincia incorrecto');
      }
      const tercerDigito = parseInt(value[2]);
      if (![6, 9].includes(tercerDigito)) {
        throw new Error('RUC debe ser de sociedad privada (6) o pública (9)');
      }
      return true;
    }),

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

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),

  body('logo_url')
    .optional()
    .isURL()
    .withMessage('Logo URL debe ser una URL válida')
];

export const updateEmpresaValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  body('nombre')
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage('Nombre debe tener entre 2 y 150 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\-&]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),

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

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),

  body('logo_url')
    .optional()
    .isURL()
    .withMessage('Logo URL debe ser una URL válida'),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso')
];

export const getEmpresaValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const deleteEmpresaValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

export const listEmpresasValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número mayor a 0'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite debe ser entre 1 y 100'),

  query('nombre')
    .optional()
    .isLength({ min: 1, max: 150 })
    .withMessage('Nombre para filtrar debe tener máximo 150 caracteres'),

  query('ruc')
    .optional()
    .isLength({ min: 1, max: 13 })
    .withMessage('RUC para filtrar debe tener máximo 13 caracteres'),

  query('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso')
];