import { DiagnosticTaskStatus } from '../models/diagnosticTask.model';

// Simule une interaction avec un service d'IA pour le diagnostic
export const processWithAI = async (systemInfo: any, userProblem?: string): Promise<any> => {
  console.log('[ai.service]: Début du traitement IA (simulation).');
  console.log('[ai.service]: Informations système reçues:', JSON.stringify(systemInfo, null, 2));
  if (userProblem) {
    console.log('[ai.service]: Problème utilisateur:', userProblem);
  }

  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 3000)); // 3 secondes de délai

  // Générer un rapport de diagnostic simulé
  const report = {
    summary: `Diagnostic basé sur le problème: "${userProblem || 'Non spécifié'}".`,
    analysis: [
      {
        component: 'CPU',
        status: systemInfo.cpu?.usage > 80 ? 'Surchargé' : 'Normal',
        details: `Utilisation CPU: ${systemInfo.cpu?.usage || 'N/A'}%. Température: ${systemInfo.cpu?.temperature || 'N/A'}°C.`,
        recommendation: systemInfo.cpu?.usage > 80 ? 'Vérifier les processus consommant beaucoup de CPU. Envisager un meilleur refroidissement.' : 'Aucune action requise.',
      },
      {
        component: 'Mémoire (RAM)',
        status: systemInfo.memory?.free < 1024 ? 'Faible' : 'Normal',
        details: `Mémoire totale: ${systemInfo.memory?.total || 'N/A'}MB. Mémoire libre: ${systemInfo.memory?.free || 'N/A'}MB.`,
        recommendation: systemInfo.memory?.free < 1024 ? 'Fermer les applications inutiles ou envisager une mise à niveau de la RAM.' : 'Aucune action requise.',
      },
      {
        component: 'Disque',
        status: systemInfo.disk?.freeSpace < 50000 ? 'Faible espace disque' : 'Normal',
        details: `Espace total: ${systemInfo.disk?.totalSpace || 'N/A'}GB. Espace libre: ${systemInfo.disk?.freeSpace || 'N/A'}MB.`,
        recommendation: systemInfo.disk?.freeSpace < 50000 ? 'Libérer de l\'espace disque en supprimant les fichiers inutiles.' : 'Aucune action requise.',
      },
      {
        component: 'Réseau',
        status: systemInfo.network?.pingTime > 100 ? 'Latence élevée' : 'Normal',
        details: `Adresse IP: ${systemInfo.network?.ipAddress || 'N/A'}. Temps de ping vers google.com: ${systemInfo.network?.pingTime || 'N/A'}ms.`,
        recommendation: systemInfo.network?.pingTime > 100 ? 'Vérifier la connexion Internet, redémarrer le routeur ou contacter le FAI.' : 'Aucune action requise.',
      }
    ],
    potentialCauses: [
      'Surchauffe du CPU due à une mauvaise ventilation ou à un overclocking excessif.',
      'Manque de mémoire vive (RAM) pour les applications en cours d\'exécution.',
      'Espace disque insuffisant, affectant les performances générales et la capacité de stockage.',
      'Problèmes de connectivité réseau ou configuration incorrecte.',
      userProblem?.toLowerCase().includes('lent') ? 'Logiciels malveillants ou trop de programmes au démarrage.' : 'Cause spécifique liée au problème décrit par l\'utilisateur.',
    ],
    suggestedSolutions: [
      'Nettoyer les ventilateurs et le dissipateur thermique du CPU.',
      'Fermer les applications gourmandes en ressources ou ajouter plus de RAM.',
      'Utiliser l\'outil de nettoyage de disque pour libérer de l\'espace.',
      'Redémarrer le modem/routeur et vérifier les câbles réseau.',
      userProblem?.toLowerCase().includes('lent') ? 'Effectuer une analyse antivirus/antimalware et optimiser les programmes de démarrage.' : 'Suivre les recommandations spécifiques aux composants.',
      'Mettre à jour les pilotes (drivers) du matériel.',
      'Consulter un technicien qualifié si le problème persiste.',
    ],
    confidenceScore: Math.random() * (0.95 - 0.65) + 0.65, // Score de confiance entre 65% et 95%
    generatedAt: new Date().toISOString(),
  };

  console.log('[ai.service]: Fin du traitement IA. Rapport généré.');
  return report;
};
