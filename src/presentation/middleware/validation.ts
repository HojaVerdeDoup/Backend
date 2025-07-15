import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ValidationError } from '../../shared/errors/AppError';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    
    // Extraer el campo de error de manera segura
    let field: string | undefined;
    if ('path' in firstError) {
      field = firstError.path;
    } else if ('param' in firstError) {
      field = (firstError as any).param;
    }
    
    throw new ValidationError(firstError.msg, field);
  }
  
  next();
};