import { Router } from 'express';
import { submitDiagnosticData, getDiagnosticReport } from '../controllers/diagnostic.controller';
import { validateAndHandle } from '../middlewares/validator.middleware';

const router = Router();

// Endpoint pour recevoir les données de l'agent
// POST /api/collecte
router.post('/collecte', validateAndHandle, submitDiagnosticData);

// Endpoint pour que le frontend récupère le rapport de diagnostic
// GET /api/diagnostic/:taskId
router.get('/diagnostic/:taskId', getDiagnosticReport);

export default router;
