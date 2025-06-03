import { Request, Response } from 'express';
import { processWithAI } from '../services/ai.service';
import { DiagnosticTask, DiagnosticTaskStatus } from '../models/diagnosticTask.model'; // Importer DiagnosticTaskStatus

// Simuler une base de données en mémoire pour les tâches
const tasksDB: Map<string, DiagnosticTask> = new Map();


export const submitDiagnosticData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { problemDescription, systemInfo } = req.body;

    if (!problemDescription && !systemInfo) {
      res.status(400).json({ message: 'Aucune donnée de diagnostic fournie (problemDescription ou systemInfo attendu).' });
      return;
    }
    
    console.log('============================================================');
    console.log('[diagnostic.controller] Données de diagnostic reçues:');
    if (problemDescription) {
      console.log('  Description du problème:', problemDescription);
    }
    if (systemInfo) {
      console.log('  Informations système (reçues par le backend):');
      // Log plus détaillé de systemInfo
      console.log(`    Timestamp: ${systemInfo.timestamp}`);
      console.log(`    Platform: ${systemInfo.platform} ${systemInfo.release} (${systemInfo.arch})`);
      console.log(`    Hostname: ${systemInfo.hostname}`);
      console.log(`    User: ${systemInfo.userInfo?.username}`);
      console.log(`    Uptime (s): ${systemInfo.uptime}`);
      console.log(`    Memory: ${systemInfo.freeMemoryMB}MB free / ${systemInfo.totalMemoryMB}MB total`);
      console.log(`    CPUs: ${systemInfo.cpuCount} cores`);
      if (systemInfo.cpus && systemInfo.cpus.length > 0) {
        console.log(`      Model: ${systemInfo.cpus[0].model}`);
      }
      console.log('    Network Interfaces (nombre):', systemInfo.networkInterfaces ? Object.keys(systemInfo.networkInterfaces).length : 'N/A');
      console.log('    Disk Info:', systemInfo.diskInfo);
      console.log('  (Fin des Informations système reçues par le backend)');
    }
    console.log('============================================================');


    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newTask: DiagnosticTask = {
      id: taskId,
      status: DiagnosticTaskStatus.PENDING, // Correction ici
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
          task.status = DiagnosticTaskStatus.PROCESSING; // Correction ici
          tasksDB.set(taskId, task);
          console.log(`[Task ${taskId}]: Début du traitement AI.`);
          const aiReport = await processWithAI(task.systemInfo || {}, task.problemDescription);
          task.report = aiReport;
          task.status = DiagnosticTaskStatus.COMPLETED; // Correction ici
          task.completedAt = new Date();
          tasksDB.set(taskId, task);
          console.log(`[Task ${taskId}]: Traitement AI terminé. Rapport généré.`);
        }
      } catch (aiError) {
        const task = tasksDB.get(taskId);
        if (task) {
          task.status = DiagnosticTaskStatus.FAILED; // Correction ici
          task.report = { error: 'Erreur lors du traitement AI.', details: aiError instanceof Error ? aiError.message : String(aiError) };
          task.error = aiError instanceof Error ? aiError.message : String(aiError);
          task.completedAt = new Date();
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

    if (task.status === DiagnosticTaskStatus.PENDING || task.status === DiagnosticTaskStatus.PROCESSING) { // Correction ici
      res.status(202).json({ 
        taskId: task.id,
        status: task.status,
        message: 'Le rapport de diagnostic est en cours de traitement. Veuillez réessayer plus tard.'
      });
      return;
    }
    
    if (task.status === DiagnosticTaskStatus.FAILED) { // Correction ici
       res.status(500).json({
        taskId: task.id,
        status: task.status,
        message: 'Le traitement du diagnostic a échoué.',
        errorDetails: task.error,
        report: task.report,
      });
      return;
    }

    if (task.status === DiagnosticTaskStatus.COMPLETED && task.report) { // Correction ici
      res.status(200).json({
        taskId: task.id,
        status: task.status,
        submittedAt: task.submittedAt.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        problemDescription: task.problemDescription,
        // systemInfoSnapshot: task.systemInfo, // Optionnel: renvoyer un snapshot des infos système
        diagnosticReport: task.report,
      });
    } else {
      // Ce cas devrait être moins probable si les statuts sont bien gérés
      res.status(404).json({ message: `Rapport pour la tâche ${taskId} est incomplet ou non disponible (statut: ${task.status}).` });
    }

  } catch (error) {
    console.error('Erreur lors de la récupération du rapport de diagnostic:', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération du rapport.' });
  }
};
