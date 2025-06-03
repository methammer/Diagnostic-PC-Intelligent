import { Request, Response } from 'express';
import { processWithAI } from '../services/ai.service'; // Assurez-vous que ce service existe

// Simuler une base de données en mémoire pour les tâches
interface DiagnosticTask {
  id: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  submittedAt: Date;
  problemDescription?: string;
  systemInfo?: any;
  report?: any;
}
const tasksDB: Map<string, DiagnosticTask> = new Map();


export const submitDiagnosticData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemDescription, systemInfo } = req.body;

    if (!problemDescription && !systemInfo) {
      res.status(400).json({ message: 'Aucune donnée de diagnostic fournie (problemDescription ou systemInfo attendu).' });
      return;
    }
    
    console.log('Données de diagnostic reçues:');
    if (problemDescription) console.log('  Description du problème:', problemDescription);
    if (systemInfo) console.log('  Informations système:', JSON.stringify(systemInfo, null, 2));

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newTask: DiagnosticTask = {
      id: taskId,
      status: 'Pending',
      submittedAt: new Date(),
      problemDescription,
      systemInfo,
    };
    tasksDB.set(taskId, newTask);

    // Simuler un traitement asynchrone
    setTimeout(async () => {
      try {
        const task = tasksDB.get(taskId);
        if (task) {
          task.status = 'Processing';
          tasksDB.set(taskId, task);
          console.log(`[Task ${taskId}]: Début du traitement AI.`);
          // Utiliser le service AI pour générer le rapport
          // Ici, nous passons systemInfo et problemDescription au service AI
          const aiReport = await processWithAI(task.systemInfo || {}, task.problemDescription);
          task.report = aiReport;
          task.status = 'Completed';
          tasksDB.set(taskId, task);
          console.log(`[Task ${taskId}]: Traitement AI terminé. Rapport généré.`);
        }
      } catch (aiError) {
        const task = tasksDB.get(taskId);
        if (task) {
          task.status = 'Failed';
          task.report = { error: 'Erreur lors du traitement AI.', details: aiError instanceof Error ? aiError.message : String(aiError) };
          tasksDB.set(taskId, task);
        }
        console.error(`[Task ${taskId}]: Erreur lors du traitement AI:`, aiError);
      }
    }, 5000); // Simuler un délai de 5 secondes pour le traitement

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

    if (task.status === 'Pending' || task.status === 'Processing') {
      res.status(202).json({ 
        taskId: task.id,
        status: task.status,
        message: 'Le rapport de diagnostic est en cours de traitement. Veuillez réessayer plus tard.'
      });
      return;
    }
    
    if (task.status === 'Failed') {
       res.status(500).json({
        taskId: task.id,
        status: task.status,
        message: 'Le traitement du diagnostic a échoué.',
        errorDetails: task.report?.error,
        report: task.report, // Inclure le rapport d'erreur s'il existe
      });
      return;
    }

    // Si complété, retourner le rapport généré par l'IA
    if (task.status === 'Completed' && task.report) {
      res.status(200).json({
        taskId: task.id,
        status: task.status,
        ...task.report, // Étaler le contenu du rapport AI ici
        // Assurez-vous que le rapport AI contient déjà un timestamp ou ajoutez-le ici
        timestamp: task.report.generatedAt || new Date(task.submittedAt).toISOString(), 
      });
    } else {
      // Fallback si le rapport n'est pas là pour une raison inconnue malgré le statut 'Completed'
      res.status(404).json({ message: `Rapport pour la tâche ${taskId} est incomplet ou non disponible.` });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du rapport de diagnostic:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération du rapport.' });
  }
};
