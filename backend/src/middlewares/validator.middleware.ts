import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateDiagnosticData: ValidationChain[] = [
  body('systemInfo').isObject().withMessage('systemInfo doit être un objet.'),
  body('systemInfo.os.name').optional().isString().withMessage('systemInfo.os.name doit être une chaîne de caractères.'),
  body('systemInfo.cpu.model').optional().isString().withMessage('systemInfo.cpu.model doit être une chaîne de caractères.'),
  body('systemInfo.cpu.usage').optional().isNumeric().withMessage('systemInfo.cpu.usage doit être un nombre.'),
  body('systemInfo.memory.total').optional().isNumeric().withMessage('systemInfo.memory.total doit être un nombre.'),
  body('systemInfo.memory.free').optional().isNumeric().withMessage('systemInfo.memory.free doit être un nombre.'),
  // Ajoutez d'autres validations au besoin pour systemInfo
  
  body('userProblem').optional().isString().trim().escape().withMessage('userProblem doit être une chaîne de caractères.'),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Combiner les validateurs et le gestionnaire d'erreurs en un seul middleware
export const validateAndHandle = [
  ...validateDiagnosticData,
  handleValidationErrors
];
