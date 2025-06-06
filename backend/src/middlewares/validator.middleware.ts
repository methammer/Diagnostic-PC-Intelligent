import { body, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Mise à jour des validateurs pour accepter systemInfoText comme une chaîne
// et rendre problemDescription optionnel si systemInfoText est fourni (ou vice-versa)
// Pour l'instant, gardons les deux optionnels mais au moins l'un des deux devrait être requis
// au niveau du contrôleur.
export const validateDiagnosticData: ValidationChain[] = [
  // Supprimé : body('systemInfo').isObject().withMessage('systemInfo doit être un objet.'),
  // Supprimé : body('systemInfo.os.name').optional().isString().withMessage('systemInfo.os.name doit être une chaîne de caractères.'),
  // ... autres validations pour systemInfo ...

  // Ajouté : validation pour systemInfoText
  body('systemInfoText')
    .optional()
    .isString().withMessage('systemInfoText doit être une chaîne de caractères.')
    .trim(), // Enlever les espaces inutiles

  body('problemDescription')
    .optional()
    .isString().withMessage('problemDescription doit être une chaîne de caractères.')
    .trim()
    .escape(),
];

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[validator.middleware] Validation errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({ 
      message: 'Erreurs de validation des données.',
      errors: errors.array() 
    });
  }
  next();
};

// Combiner les validateurs et le gestionnaire d'erreurs en un seul middleware
export const validateAndHandle = [
  ...validateDiagnosticData,
  handleValidationErrors
];
