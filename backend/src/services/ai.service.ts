import { AIReport } from '../models/diagnosticTask.model';

// Simule une latence pour l'appel à une IA externe
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fonction pour traiter les données avec une "IA" (simulation)
// systemInfoRaw est maintenant le texte brut du fichier .bat
export const processWithAI = async (systemInfoRaw: string | undefined, problemDescription?: string): Promise<AIReport> => {
  console.log(`[ai.service] Début du traitement AI. Description: "${problemDescription ? problemDescription.substring(0,100)+'...' : 'N/A'}", Longueur des infos système brutes: ${systemInfoRaw?.length ?? 0}`);
  await sleep(3000); // Simule le temps de traitement de l'IA

  // Logique de l'IA pour parser et interpréter systemInfoRaw.
  // Ceci est une simulation basique. Une vraie IA nécessiterait un parsing plus complexe.
  let systemAnalysisDetails = 'Aucune information système brute n\'a été fournie ou elle est vide.';
  let systemStatus = 'Non fournies';
  let systemRecommendation = 'Fournir les informations système via le script .bat pour un diagnostic plus précis.';

  if (systemInfoRaw && systemInfoRaw.trim().length > 0) {
    systemStatus = 'Reçues (Texte Brut)';
    // Tentative de détection de sections pour une analyse un peu plus "intelligente" (très basique)
    if (systemInfoRaw.includes("[SECTION_DEBUT: Pilotes Systemes]")) {
      systemAnalysisDetails = `Les données brutes du système (${systemInfoRaw.length} caractères) ont été reçues. Contient une section sur les pilotes systèmes. Nécessite une analyse détaillée par l'IA.`;
    } else if (systemInfoRaw.includes("Windows IP Configuration")) {
      systemAnalysisDetails = `Les données brutes du système (${systemInfoRaw.length} caractères) ont été reçues. Semble contenir des informations réseau. Nécessite une analyse détaillée par l'IA.`;
    } else {
      systemAnalysisDetails = `Les données brutes du système (${systemInfoRaw.length} caractères) ont été reçues et nécessitent une analyse détaillée par l'IA. Format non spécifiquement reconnu.`;
    }
    systemRecommendation = 'L\'IA doit interpréter ces données textuelles pour identifier les problèmes potentiels.';
  }


  const mockReport: AIReport = {
    summary: `Analyse basée sur ${problemDescription ? `la description "${problemDescription}"` : 'les informations système uniquement'}. Les informations système ont été fournies sous forme de texte brut.`,
    analysis: [
      {
        component: 'Informations Système (Texte Brut)',
        status: systemStatus,
        details: systemAnalysisDetails,
        recommendation: systemRecommendation,
      },
      {
        component: 'Description du Problème',
        status: problemDescription ? 'Fournie' : 'Non fournie',
        details: problemDescription ? `Problème décrit: "${problemDescription}"` : 'Aucune description de problème fournie.',
        recommendation: problemDescription ? 'Analyser en conjonction avec les informations système.' : 'Fournir une description du problème pour aider au diagnostic.'
      }
    ],
    potentialCauses: (systemInfoRaw && systemInfoRaw.length > 0 && problemDescription)
      ? ['Analyse en cours par l\'IA à partir du texte brut...'] 
      : ['Informations insuffisantes pour déterminer les causes potentielles sans analyse IA des données brutes et/ou description du problème.'],
    suggestedSolutions: (systemInfoRaw && systemInfoRaw.length > 0 && problemDescription)
      ? ['Solutions en attente de l\'analyse IA du texte brut...']
      : ['Veuillez fournir à la fois la description du problème et les informations système pour des suggestions.'],
    confidenceScore: (systemInfoRaw && systemInfoRaw.length > 0 && problemDescription) ? 0.55 : 0.15,
    generatedAt: new Date().toISOString(),
  };

  // Simuler une erreur IA occasionnelle pour tester le flux d'erreur
  // if (Math.random() < 0.1) { // 10% de chance d'erreur
  //   console.error("[ai.service] Erreur simulée de l'IA.");
  //   throw new Error("Erreur simulée lors du traitement par l'IA.");
  // }

  console.log('[ai.service] Traitement AI terminé (simulation avec texte brut).');
  return mockReport;
};
