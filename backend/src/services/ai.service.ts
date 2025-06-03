import { DiagnosticTaskStatus, SystemInfo } from '../models/diagnosticTask.model';

export const processWithAI = async (systemInfo: SystemInfo, userProblem?: string): Promise<any> => {
  console.log('[ai.service]: Début du traitement IA (simulation).');
  console.log('[ai.service]: Informations système reçues:', JSON.stringify(systemInfo, null, 2));
  if (userProblem) {
    console.log('[ai.service]: Problème utilisateur:', userProblem);
  }

  // Simuler un délai de traitement
  await new Promise(resolve => setTimeout(resolve, 1000)); 

  // Helper pour parser les valeurs de mémoire qui peuvent être "N/A" ou des string numériques
  const parseMemory = (memValueStr: string | undefined): number | null => {
    if (memValueStr === undefined || memValueStr === null || memValueStr.trim().toUpperCase() === "N/A" || memValueStr.trim() === "") {
      return null;
    }
    const parsed = parseFloat(memValueStr);
    return isNaN(parsed) ? null : parsed;
  };

  // Convertir en chaîne de caractères avant de parser, pour satisfaire la signature de parseMemory
  // et gérer le type string | number de SystemInfo.
  const totalMemoryMBString = typeof systemInfo.totalMemoryMB === 'number' 
    ? String(systemInfo.totalMemoryMB) 
    : systemInfo.totalMemoryMB;
  const freeMemoryMBString = typeof systemInfo.freeMemoryMB === 'number'
    ? String(systemInfo.freeMemoryMB)
    : systemInfo.freeMemoryMB;

  const totalMemory = parseMemory(totalMemoryMBString);
  const freeMemory = parseMemory(freeMemoryMBString);

  let primaryIpAddress = 'N/A';
  if (systemInfo.networkInterfaces) {
    for (const ifaceName in systemInfo.networkInterfaces) {
      const ifaceDetails = systemInfo.networkInterfaces[ifaceName];
      if (ifaceDetails) {
        const ipv4 = ifaceDetails.find(details => details.family === 'IPv4' && !details.internal);
        if (ipv4) {
          primaryIpAddress = ipv4.address;
          break;
        }
      }
    }
  }
  
  const cpuModel = systemInfo.cpus && systemInfo.cpus.length > 0 ? systemInfo.cpus[0].model : 'N/A';
  const cpuSpeed = systemInfo.cpus && systemInfo.cpus.length > 0 ? systemInfo.cpus[0].speed : 'N/A';

  // Déterminer le statut de la mémoire
  let memoryStatus = 'Normal';
  if (freeMemory !== null) {
    if (totalMemory !== null && totalMemory > 0 && (freeMemory / totalMemory) < 0.1) { // Moins de 10% de RAM libre
        memoryStatus = 'Critiquement Faible';
    } else if (freeMemory < 1024) { // Moins de 1GB de RAM libre
        memoryStatus = 'Faible';
    }
  }


  // Générer un rapport de diagnostic simulé
  const report = {
    summary: `Diagnostic basé sur le problème: "${userProblem || 'Non spécifié'}" et les informations système fournies.`,
    analysis: [
      {
        component: 'CPU',
        status: 'Normal (simulation)', 
        details: `Modèle: ${cpuModel}. Vitesse: ${cpuSpeed}MHz. Usage/Température: Non collectés par l'agent.`,
        recommendation: 'Vérifier les processus consommant beaucoup de CPU si des lenteurs sont observées. Envisager un meilleur refroidissement si applicable.',
      },
      {
        component: 'Mémoire (RAM)',
        status: memoryStatus,
        details: `Mémoire totale: ${systemInfo.totalMemoryMB || 'N/A'}MB. Mémoire libre: ${systemInfo.freeMemoryMB || 'N/A'}MB.`,
        recommendation: (memoryStatus === 'Faible' || memoryStatus === 'Critiquement Faible') ? 'Fermer les applications inutiles ou envisager une mise à niveau de la RAM.' : 'Aucune action spécifique requise basée sur la mémoire libre.',
      },
      {
        component: 'Disque',
        status: 'Information non disponible', 
        details: `Informations disque: ${systemInfo.diskInfo || 'Non collecté par l\'agent'}.`,
        recommendation: 'Si des problèmes de stockage ou de performance disque sont suspectés, utiliser les outils système pour vérifier l\'espace et la santé du disque.',
      },
      {
        component: 'Réseau',
        status: 'Normal (simulation)', 
        details: `Adresse IP principale (détectée): ${primaryIpAddress}. Ping: Non collecté par l'agent.`,
        recommendation: 'Si des problèmes de réseau sont suspectés, vérifier la connexion Internet, redémarrer le routeur ou contacter le FAI.',
      }
    ],
    potentialCauses: [
      'Surchauffe du CPU due à une mauvaise ventilation ou à un overclocking excessif (si applicable).',
      'Manque de mémoire vive (RAM) pour les applications en cours d\'exécution (si la mémoire libre est effectivement basse).',
      'Espace disque insuffisant (si applicable, non vérifié par l\'agent).',
      'Problèmes de connectivité réseau ou configuration incorrecte.',
      userProblem?.toLowerCase().includes('lent') ? 'Logiciels malveillants ou trop de programmes au démarrage.' : 'Cause spécifique liée au problème décrit par l\'utilisateur.',
    ],
    suggestedSolutions: [
      'Nettoyer les ventilateurs et le dissipateur thermique du CPU.',
      'Fermer les applications gourmandes en ressources ou ajouter plus de RAM si nécessaire.',
      'Utiliser l\'outil de nettoyage de disque pour libérer de l\'espace (si applicable).',
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
