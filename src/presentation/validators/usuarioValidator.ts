// Ruta: src/presentation/validators/usuarioValidator.ts

import { body, query, param, ValidationChain } from 'express-validator';

// ========== Validadores para Crear Usuario ==========
export const createUsuarioValidator: ValidationChain[] = [
  body('empresa_id')
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  body('sucursal_id')
    .optional()
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),

  body('email')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Password debe contener al menos una letra y un número'),

  body('nombres')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombres debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombres solo puede contener letras y espacios')
    .trim(),

  body('apellidos')
    .isLength({ min: 2, max: 100 })
    .withMessage('Apellidos debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellidos solo puede contener letras y espacios')
    .trim(),

  body('rol')
    .isIn(['super_admin', 'admin', 'manager', 'supervisor', 'viewer'])
    .withMessage('Rol inválido'),

  body('telefono')
    .optional()
    .matches(/^[\d\s\-\(\)]+$/)
    .withMessage('Teléfono contiene caracteres inválidos')
    .isLength({ min: 7, max: 20 })
    .withMessage('Teléfono debe tener entre 7 y 20 caracteres'),

  body('cedula')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Cédula debe tener exactamente 10 dígitos')
    .isNumeric()
    .withMessage('Cédula solo puede contener números')
    .custom((value) => {
      if (!value) return true; // Es opcional
      
      // Validación básica de cédula ecuatoriana
      const provincia = parseInt(value.substring(0, 2));
      if (provincia < 1 || provincia > 24) {
        throw new Error('Cédula inválida: código de provincia incorrecto');
      }
      
      // Algoritmo de validación de cédula ecuatoriana
      const digits = value.split('').map(Number);
      const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let sum = 0;
      
      for (let i = 0; i < 9; i++) {
        let product = digits[i] * coefficients[i];
        if (product >= 10) product -= 9;
        sum += product;
      }
      
      const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);
      if (verifier !== digits[9]) {
        throw new Error('Cédula ecuatoriana inválida');
      }
      
      return true;
    }),

  body('direccion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Dirección no puede exceder 500 caracteres')
    .trim(),

  body('fecha_nacimiento')
    .optional()
    .isISO8601()
    .withMessage('Fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)')
    .custom((value) => {
      if (!value) return true; // Es opcional
      
      const birthDate = new Date(value);
      const today = new Date();
      
      if (birthDate > today) {
        throw new Error('Fecha de nacimiento no puede ser futura');
      }
      
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 16);
      if (birthDate > minAge) {
        throw new Error('El usuario debe tener al menos 16 años');
      }
      
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 100);
      if (birthDate < maxAge) {
        throw new Error('Fecha de nacimiento no válida');
      }
      
      return true;
    })
];

// ========== Validadores para Actualizar Usuario ==========
export const updateUsuarioValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  body('nombres')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombres debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombres solo puede contener letras y espacios')
    .trim(),

  body('apellidos')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Apellidos debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellidos solo puede contener letras y espacios')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email no puede exceder 255 caracteres'),

  body('rol')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'supervisor', 'viewer'])
    .withMessage('Rol inválido'),

  body('sucursal_id')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true; // Permitir null/vacío para limpiar
      if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
        return true;
      }
      throw new Error('ID de sucursal debe ser un UUID válido o null');
    }),

  body('telefono')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true; // Permitir null/vacío para limpiar
      if (/^[\d\s\-\(\)]+$/.test(value) && value.length >= 7 && value.length <= 20) {
        return true;
      }
      throw new Error('Teléfono debe tener entre 7 y 20 caracteres y solo contener números, espacios, guiones y paréntesis');
    }),

  body('cedula')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true; // Permitir null/vacío para limpiar
      
      if (!/^\d{10}$/.test(value)) {
        throw new Error('Cédula debe tener exactamente 10 dígitos');
      }
      
      // Validación de cédula ecuatoriana
      const provincia = parseInt(value.substring(0, 2));
      if (provincia < 1 || provincia > 24) {
        throw new Error('Cédula inválida: código de provincia incorrecto');
      }
      
      const digits = value.split('').map(Number);
      const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let sum = 0;
      
      for (let i = 0; i < 9; i++) {
        let product = digits[i] * coefficients[i];
        if (product >= 10) product -= 9;
        sum += product;
      }
      
      const verifier = sum % 10 === 0 ? 0 : 10 - (sum % 10);
      if (verifier !== digits[9]) {
        throw new Error('Cédula ecuatoriana inválida');
      }
      
      return true;
    }),

  body('direccion')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true; // Permitir null/vacío para limpiar
      if (value.length <= 500) return true;
      throw new Error('Dirección no puede exceder 500 caracteres');
    }),

  body('fecha_nacimiento')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true; // Permitir null/vacío para limpiar
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error('Fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)');
      }
      
      const birthDate = new Date(value);
      const today = new Date();
      
      if (birthDate > today) {
        throw new Error('Fecha de nacimiento no puede ser futura');
      }
      
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 16);
      if (birthDate > minAge) {
        throw new Error('El usuario debe tener al menos 16 años');
      }
      
      return true;
    }),

  body('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso')
];

// ========== Validadores para Obtener Usuario ==========
export const getUsuarioValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

// ========== Validadores para Eliminar Usuario ==========
export const deleteUsuarioValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido')
];

// ========== Validadores para Listar Usuarios ==========
export const listUsuariosValidator: ValidationChain[] = [
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

  query('sucursal_id')
    .optional()
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),

  query('nombres')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombres para filtrar debe tener máximo 100 caracteres'),

  query('apellidos')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Apellidos para filtrar debe tener máximo 100 caracteres'),

  query('email')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('Email para filtrar debe tener máximo 255 caracteres'),

  query('rol')
    .optional()
    .isIn(['super_admin', 'admin', 'manager', 'supervisor', 'viewer'])
    .withMessage('Rol para filtrar inválido'),

  query('cedula')
    .optional()
    .isLength({ min: 1, max: 10 })
    .withMessage('Cédula para filtrar debe tener máximo 10 caracteres'),

  query('activo')
    .optional()
    .isBoolean()
    .withMessage('Activo debe ser verdadero o falso')
];

// ========== Validadores para Búsqueda de Usuarios ==========
export const searchUsuariosValidator: ValidationChain[] = [
  query('q')
    .notEmpty()
    .withMessage('Término de búsqueda es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('Término de búsqueda debe tener entre 2 y 100 caracteres'),

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
    .withMessage('ID de empresa debe ser un UUID válido')
];

// ========== Validadores para Verificación de Disponibilidad ==========
export const checkEmailAvailabilityValidator: ValidationChain[] = [
  query('email')
    .notEmpty()
    .withMessage('Email es requerido')
    .isEmail()
    .withMessage('Email debe ser válido')
    .normalizeEmail(),

  query('exclude_id')
    .optional()
    .isUUID()
    .withMessage('ID a excluir debe ser un UUID válido')
];

export const checkCedulaAvailabilityValidator: ValidationChain[] = [
  query('cedula')
    .notEmpty()
    .withMessage('Cédula es requerida')
    .isLength({ min: 10, max: 10 })
    .withMessage('Cédula debe tener exactamente 10 dígitos')
    .isNumeric()
    .withMessage('Cédula solo puede contener números'),

  query('exclude_id')
    .optional()
    .isUUID()
    .withMessage('ID a excluir debe ser un UUID válido')
];

// ========== Validadores para Cambio de Contraseña ==========
export const changePasswordValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  body('current_password')
    .optional() // Solo requerido para auto-cambio
    .isLength({ min: 1 })
    .withMessage('Contraseña actual es requerida'),

  body('new_password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Nueva contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Nueva contraseña debe contener al menos una letra y un número')
    .custom((value, { req }) => {
      // Verificar que no sea una contraseña común
      const commonPasswords = [
        'password', '123456', 'password123', 'admin123', 'qwerty',
        'letmein', 'welcome', 'monkey', 'dragon', 'password1'
      ];
      
      if (commonPasswords.includes(value.toLowerCase())) {
        throw new Error('La contraseña es demasiado común. Elige una más segura');
      }

      // Verificar complejidad
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

      if (complexityScore < 3) {
        throw new Error('La contraseña debe contener al menos 3 de los siguientes: mayúsculas, minúsculas, números, caracteres especiales');
      }

      return true;
    }),

  body('confirm_password')
    .notEmpty()
    .withMessage('Confirmación de contraseña es requerida')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// ========== Validadores para Reset de Contraseña ==========
export const resetPasswordValidator: ValidationChain[] = [
  param('id')
    .isUUID()
    .withMessage('ID debe ser un UUID válido'),

  body('new_password')
    .optional() // Si no se proporciona, se genera una temporal
    .isLength({ min: 8, max: 128 })
    .withMessage('Nueva contraseña debe tener entre 8 y 128 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('Nueva contraseña debe contener al menos una letra y un número')
];

// ========== Validadores para Actualizar Perfil ==========
export const updateProfileValidator: ValidationChain[] = [
  body('nombres')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombres debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombres solo puede contener letras y espacios')
    .trim(),

  body('apellidos')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Apellidos debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellidos solo puede contener letras y espacios')
    .trim(),

  body('telefono')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (/^[\d\s\-\(\)]+$/.test(value) && value.length >= 7 && value.length <= 20) {
        return true;
      }
      throw new Error('Teléfono debe tener entre 7 y 20 caracteres');
    }),

  body('direccion')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      if (value.length <= 500) return true;
      throw new Error('Dirección no puede exceder 500 caracteres');
    }),

  body('fecha_nacimiento')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null || value === '') return true;
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error('Fecha de nacimiento debe ser una fecha válida (YYYY-MM-DD)');
      }
      
      const birthDate = new Date(value);
      const today = new Date();
      
      if (birthDate > today) {
        throw new Error('Fecha de nacimiento no puede ser futura');
      }
      
      const minAge = new Date();
      minAge.setFullYear(today.getFullYear() - 16);
      if (birthDate > minAge) {
        throw new Error('El usuario debe tener al menos 16 años');
      }
      
      return true;
    }),

  // Prohibir explícitamente campos que no se pueden cambiar en perfil
  body('email').not().exists().withMessage('No puedes cambiar el email desde el perfil'),
  body('rol').not().exists().withMessage('No puedes cambiar el rol desde el perfil'),
  body('empresa_id').not().exists().withMessage('No puedes cambiar la empresa desde el perfil'),
  body('sucursal_id').not().exists().withMessage('No puedes cambiar la sucursal desde el perfil'),
  body('activo').not().exists().withMessage('No puedes cambiar el estado desde el perfil')
];

// ========== Validadores para Estadísticas ==========
export const getStatsValidator: ValidationChain[] = [
  query('empresa_id')
    .optional()
    .isUUID()
    .withMessage('ID de empresa debe ser un UUID válido'),

  query('sucursal_id')
    .optional()
    .isUUID()
    .withMessage('ID de sucursal debe ser un UUID válido'),

  query('fecha_desde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser una fecha válida (YYYY-MM-DD)'),

  query('fecha_hasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser una fecha válida (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.query && req.query.fecha_desde) {
        const fechaDesde = new Date(req.query.fecha_desde as string);
        const fechaHasta = new Date(value);
        
        if (fechaHasta < fechaDesde) {
          throw new Error('Fecha hasta debe ser posterior a fecha desde');
        }
      }
      return true;
    })
];

// ========== Validadores para Operaciones Masivas ==========
export const bulkUpdateStatusValidator: ValidationChain[] = [
  body('user_ids')
    .isArray({ min: 1, max: 50 })
    .withMessage('Debe proporcionar entre 1 y 50 IDs de usuario'),

  body('user_ids.*')
    .isUUID()
    .withMessage('Cada ID de usuario debe ser un UUID válido'),

  body('activo')
    .isBoolean()
    .withMessage('Estado activo debe ser verdadero o falso')
];

export const bulkDeleteValidator: ValidationChain[] = [
  body('user_ids')
    .isArray({ min: 1, max: 20 })
    .withMessage('Debe proporcionar entre 1 y 20 IDs de usuario'),

  body('user_ids.*')
    .isUUID()
    .withMessage('Cada ID de usuario debe ser un UUID válido')
];