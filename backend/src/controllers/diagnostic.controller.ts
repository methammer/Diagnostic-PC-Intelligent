import { Request, Response } from 'express';
import { processWithAI } from '../services/ai.service';
import { DiagnosticTask, DiagnosticTaskStatus, SystemInfo } from '../models/diagnosticTask.model';

const tasksDB: Map<string, DiagnosticTask> = new Map();

export const submitDiagnosticData = async (req: Request, res: Response): Promise<void> => {
  try {
    // Enhanced logging:
    console.log('============================================================');
    console.log('[diagnostic.controller] Received request for /api/collecte.');
    console.log('[diagnostic.controller] Request Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[diagnostic.controller] Request Body:', JSON.stringify(req.body, null, 2));
    console.log('============================================================');

    const { problemDescription, systemInfo } = req.body as { problemDescription?: string, systemInfo?: SystemInfo };

    // Log the destructured values
    console.log(`[diagnostic.controller] Destructured problemDescription: '${problemDescription}' (type: ${typeof problemDescription})`);
    console.log(`[diagnostic.controller] Destructured systemInfo: ${systemInfo ? JSON.stringify(systemInfo).substring(0,100)+'...' : 'undefined'} (type: ${typeof systemInfo})`);


    if (!problemDescription && !systemInfo) {
      console.error('[diagnostic.controller] Validation failed: problemDescription and systemInfo are both missing or effectively empty.');
      res.status(400).json({ message: 'Aucune donnée de diagnostic fournie (problemDescription ou systemInfo attendu).' });
      return;
    }
    
    console.log('[diagnostic.controller] Diagnostic data received (after validation):');
    if (problemDescription) {
      console.log('  Problem Description:', problemDescription);
    }
    if (systemInfo) {
      console.log('  System Information (from request):', JSON.stringify(systemInfo, null, 2).substring(0, 200) + '...');
    }
    console.log('============================================================');

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newTask: DiagnosticTask = {
      id: taskId,
      status: DiagnosticTaskStatus.PENDING,
      submittedAt: new Date(),
      problemDescription,
      systemInfo,
    };
    tasksDB.set(taskId, newTask);

    setTimeout(async () => {
      try {
        const task = tasksDB.get(taskId);
        if (task) {
          task.status = DiagnosticTaskStatus.PROCESSING;
          tasksDB.set(taskId, task);
          console.log(`[Task ${taskId}]: Début du traitement AI.`);
          const aiReport = await processWithAI(task.systemInfo || {} as SystemInfo, task.problemDescription);
          task.report = aiReport;
          task.status = DiagnosticTaskStatus.COMPLETED;
          task.completedAt = new Date();
          tasksDB.set(taskId, task);
          console.log(`[Task ${taskId}]: Traitement AI terminé. Rapport généré.`);
        }
      } catch (aiError) {
        const task = tasksDB.get(taskId);
        if (task) {
          task.status = DiagnosticTaskStatus.FAILED;
          const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
          task.report = { error: 'Erreur lors du traitement AI.', details: errorMessage };
          task.error = errorMessage;
          task.completedAt = new Date();
          tasksDB.set(taskId, task);
        }
        console.error(`[Task ${taskId}]: Erreur lors du traitement AI:`, aiError);
      }
    }, 5000); 

    res.status(202).json({ 
      message: 'Données de diagnostic reçues, traitement en cours.',
      taskId: taskId 
    });
  } catch (error) {
    console.error('Erreur lors de la soumission des données de diagnostic:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la soumission des données.' });
  }
};

export const getDiagnosticReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId } = req.params;
    const task = tasksDB.get(taskId);

    if (!task) {
      res.status(404).json({ message: `Rapport pour la tâche ${taskId} non trouvé.` });
      return;
    }

    if (task.status === DiagnosticTaskStatus.PENDING || task.status === DiagnosticTaskStatus.PROCESSING) {
      res.status(202).json({ 
        taskId: task.id,
        status: task.status,
        submittedAt: task.submittedAt.toISOString(),
        problemDescription: task.problemDescription,
        message: task.status === DiagnosticTaskStatus.PENDING ? 'Le diagnostic est en attente de traitement.' : 'Le rapport de diagnostic est en cours de traitement. Veuillez réessayer plus tard.'
      });
      return;
    }
    
    if (task.status === DiagnosticTaskStatus.FAILED) {
       res.status(200).json({
        taskId: task.id,
        status: task.status,
        submittedAt: task.submittedAt.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        problemDescription: task.problemDescription,
        errorDetails: `Le traitement du diagnostic a échoué. ${task.error ? `Détails: ${task.error}` : 'Aucun détail supplémentaire.'}`,
        diagnosticReport: task.report,
      });
      return;
    }

    if (task.status === DiagnosticTaskStatus.COMPLETED && task.report) {
      res.status(200).json({
        taskId: task.id,
        status: task.status,
        submittedAt: task.submittedAt.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        problemDescription: task.problemDescription,
        diagnosticReport: task.report,
      });
    } else {
      res.status(404).json({ 
        message: `Rapport pour la tâche ${taskId} est dans un état inattendu ou incomplet (statut: ${task.status}).`,
        taskId: task.id,
        status: task.status,
        submittedAt: task.submittedAt.toISOString(),
      });
    }

  } catch (error)
{
    console.error('Erreur lors de la récupération du rapport de diagnostic:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération du rapport.' });
  }
};
