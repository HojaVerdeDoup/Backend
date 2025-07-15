import { body, ValidationChain } from 'express-validator';

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password debe tener al menos 6 caracteres')
    .notEmpty()
    .withMessage('Password es requerido')
];

export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password debe tener al menos 8 caracteres')
    .matches(/(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password debe contener al menos una letra y un número'),
    
  body('nombres')
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombres debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombres solo puede contener letras y espacios'),
    
  body('apellidos')
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellidos debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellidos solo puede contener letras y espacios'),
    
  body('rol')
    .isIn(['super_admin', 'admin', 'manager', 'supervisor', 'viewer'])
    .withMessage('Rol inválido'),
    
  body('empresa_id')
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),
    
  body('sucursal_id')
    .optional()
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido')
];

export const refreshTokenValidator: ValidationChain[] = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token es requerido')
    .isJWT()
    .withMessage('Refresh token debe ser un JWT válido')
];