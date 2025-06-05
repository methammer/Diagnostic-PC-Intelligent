import { Router } from 'express';
import { body } from 'express-validator';
import * as diagnosticController from '../controllers/diagnostic.controller';

const router = Router();

router.post(
  '/',
  [
    body('problemDescription').notEmpty().withMessage('Problem description is required.'),
    // systemInfoJSON and advancedSystemInfo are optional
    body('systemInfoJSON').optional().isString(),
    body('advancedSystemInfo').optional().isString(),
  ],
  diagnosticController.createDiagnosticTask
);

router.get(
  '/download-script',
  diagnosticController.downloadWindowsScript
);

export default router;
