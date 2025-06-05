import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SystemInfo } from '../models/diagnosticTask.model'; // DiagnosticTaskStatus might not be needed here
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("GEMINI_API_KEY is not set in the environment variables. AI service will not function.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }) : null;

interface ReportAnalysisItem {
  component: string;
  status: string;
  details: string;
  recommendation: string;
}

interface Report {
  summary: string;
  analysis: ReportAnalysisItem[];
  potentialCauses: string[];
  suggestedSolutions: string[];
  confidenceScore: number;
  generatedAt: string;
  error?: string; 
  details?: string; 
}

const formatSystemInfoForPrompt = (systemInfo: SystemInfo): string => {
  let formatted = "Informations Système de Base (issues de l'agent Node.js):\n";
  if (Object.keys(systemInfo).length === 0) {
    formatted += "Aucune information système de base n'a été fournie ou n'a pu être parsée.\n";
  } else {
    formatted += `- Plateforme: ${systemInfo.platform || 'N/A'}\n`;
    formatted += `- Version OS: ${systemInfo.release || 'N/A'}\n`;
    formatted += `- Architecture: ${systemInfo.arch || 'N/A'}\n`;
    formatted += `- Nom d'hôte: ${systemInfo.hostname || 'N/A'}\n`;
    formatted += `- Temps de fonctionnement: ${systemInfo.uptime ? (systemInfo.uptime / 3600).toFixed(2) + ' heures' : 'N/A'}\n`;
    formatted += `- Mémoire Totale: ${systemInfo.totalMemoryMB || 'N/A'} MB\n`;
    formatted += `- Mémoire Libre: ${systemInfo.freeMemoryMB || 'N/A'} MB\n`;
    formatted += `- Nombre de CPUs: ${systemInfo.cpuCount || 'N/A'}\n`;

    if (systemInfo.cpus && systemInfo.cpus.length > 0) {
      formatted += "- CPUs:\n";
      systemInfo.cpus.forEach((cpu, index) => {
        formatted += `  - CPU ${index + 1}: Modèle: ${cpu.model || 'N/A'}, Vitesse: ${cpu.speed || 'N/A'} MHz\n`;
      });
    }

    if (systemInfo.networkInterfaces) {
      formatted += "- Interfaces Réseau:\n";
      for (const ifaceName in systemInfo.networkInterfaces) {
        const ifaceDetails = systemInfo.networkInterfaces[ifaceName];
        if (ifaceDetails) {
          ifaceDetails.forEach(details => {
            if (details.family === 'IPv4' && !details.internal) {
              formatted += `  - ${ifaceName}: IPv4 ${details.address || 'N/A'}\n`;
            }
          });
        }
      }
    }
    formatted += `- Informations Disque (agent Node.js): ${systemInfo.diskInfo || 'Non collecté par l\'agent Node.js.'}\n`;
  }
  return formatted;
};

const parseGeminiResponseToReport = (geminiResponse: string, userProblem?: string): Report => {
  const report: Report = {
    summary: `Diagnostic IA basé sur le problème: "${userProblem || 'Non spécifié'}" et les informations système.`,
    analysis: [],
    potentialCauses: [],
    suggestedSolutions: [],
    confidenceScore: 0.85, 
    generatedAt: new Date().toISOString(),
  };

  const lines = geminiResponse.split(/\\n|\n/);
  let currentSectionKey: 'analysis' | 'potentialCauses' | 'suggestedSolutions' | 'summary' = 'summary';
  let generalContentBuffer = "";

  const sectionKeywords = {
    analysis: /^(analyse détaillée?|analyse technique|diagnostic détaillé?):/i,
    potentialCauses: /^(causes potentielles|causes possibles|problèmes identifiés):/i,
    suggestedSolutions: /^(solutions suggérées?|recommandations|étapes de résolution|plan d'action):/i,
  };

  lines.forEach(line => {
    const cleanedLine = line.trim();
    if (cleanedLine.length === 0) return;

    let matchedNewSection: 'analysis' | 'potentialCauses' | 'suggestedSolutions' | null = null;

    if (sectionKeywords.analysis.test(cleanedLine)) {
      matchedNewSection = 'analysis';
    } else if (sectionKeywords.potentialCauses.test(cleanedLine)) {
      matchedNewSection = 'potentialCauses';
    } else if (sectionKeywords.suggestedSolutions.test(cleanedLine)) {
      matchedNewSection = 'suggestedSolutions';
    }

    if (matchedNewSection) {
      if (generalContentBuffer.trim() && currentSectionKey === 'summary') { 
         report.analysis.push({ component: 'Introduction IA', status: 'Selon IA', details: generalContentBuffer.trim(), recommendation: '' });
         generalContentBuffer = ""; 
      } else if (generalContentBuffer.trim() && currentSectionKey === 'analysis') {
         report.analysis.push({ component: 'Détail Analyse (continué)', status: 'Selon IA', details: generalContentBuffer.trim(), recommendation: '' });
         generalContentBuffer = "";
      }

      currentSectionKey = matchedNewSection;
      const headerText = cleanedLine.substring(cleanedLine.indexOf(':') + 1).trim();
      if (headerText) { 
        if (currentSectionKey === 'analysis') {
          report.analysis.push({ component: 'Analyse Initiale', status: 'Selon IA', details: headerText, recommendation: 'Voir détails ci-dessous si applicable.' });
        } else if (currentSectionKey === 'potentialCauses') {
          report.potentialCauses.push(headerText);
        } else if (currentSectionKey === 'suggestedSolutions') {
          report.suggestedSolutions.push(headerText);
        }
      }
    } else { 
      switch (currentSectionKey) {
        case 'summary': 
          generalContentBuffer += (generalContentBuffer ? "\n" : "") + cleanedLine;
          break;
        case 'analysis':
          report.analysis.push({ component: 'Détail Analyse', status: 'Selon IA', details: cleanedLine, recommendation: '' });
          break;
        case 'potentialCauses':
          report.potentialCauses.push(cleanedLine);
          break;
        case 'suggestedSolutions':
          report.suggestedSolutions.push(cleanedLine);
          break;
      }
    }
  });
  
  if (generalContentBuffer.trim()) {
    if (currentSectionKey === 'summary') { 
      report.analysis.push({
        component: 'Résumé IA Complet',
        status: 'Traitement IA',
        details: generalContentBuffer.trim(),
        recommendation: 'Veuillez lire attentivement la réponse de l\'IA. La structuration automatique a pu rencontrer des variations.'
      });
    } else if (currentSectionKey === 'analysis' && report.analysis.length > 0) {
        const lastAnalysisItem = report.analysis[report.analysis.length -1];
        if (lastAnalysisItem && lastAnalysisItem.details.length < 500) { 
            lastAnalysisItem.details += "\n" + generalContentBuffer.trim();
        } else {
            report.analysis.push({ component: 'Détail Analyse (fin)', status: 'Selon IA', details: generalContentBuffer.trim(), recommendation: '' });
        }
    } else if (currentSectionKey === 'analysis') { 
         report.analysis.push({ component: 'Détail Analyse', status: 'Selon IA', details: generalContentBuffer.trim(), recommendation: '' });
    }
  }

  if (geminiResponse.trim() && report.analysis.length === 0 && report.potentialCauses.length === 0 && report.suggestedSolutions.length === 0) {
     report.analysis.push({
        component: 'Réponse Brute IA',
        status: 'Non Structuré',
        details: geminiResponse, 
        recommendation: 'La réponse de l\'IA n\'a pas pu être structurée automatiquement. Veuillez lire le contenu brut.'
    });
  }
  return report;
};


export const processWithAI = async (systemInfo: SystemInfo, userProblem?: string, advancedSystemInfo?: string): Promise<Report> => {
  console.log('[ai.service]: Début du traitement avec Gemini AI.');
  
  if (!model || !genAI) {
    console.error('[ai.service]: Gemini AI SDK non initialisé (API KEY manquante ou invalide?). Utilisation du fallback simulé.');
    return generateSimulatedReport(systemInfo, userProblem, undefined, advancedSystemInfo);
  }

  const formattedSysInfo = formatSystemInfoForPrompt(systemInfo);
  const problemDesc = userProblem || "L'utilisateur n'a pas fourni de description spécifique du problème.";
  
  let advancedInfoPromptSection = "";
  if (advancedSystemInfo && advancedSystemInfo.trim().length > 0) {
    advancedInfoPromptSection = `
    Informations Système Avancées (issues d'un script .bat Windows, si fournies):
    --- DEBUT DES INFOS AVANCEES ---
    ${advancedSystemInfo.trim()}
    --- FIN DES INFOS AVANCEES ---
    Prenez en compte ces informations avancées pour affiner votre diagnostic si elles sont pertinentes.
    `;
  } else {
    advancedInfoPromptSection = "Aucune information système avancée (script .bat) n'a été fournie.\n";
  }

  const prompt = `
    Vous êtes un expert en diagnostic informatique. Analysez la description du problème suivante et les informations système fournies (de base et avancées si disponibles).
    Générez un rapport de diagnostic complet en français.

    Description du problème par l'utilisateur:
    "${problemDesc}"

    ${formattedSysInfo}

    ${advancedInfoPromptSection}

    Instructions de formatage du rapport (IMPORTANT):
    Votre réponse DOIT être structurée avec les sections suivantes. Chaque titre de section DOIT être sur sa propre ligne et correspondre EXACTEMENT à ceux listés ci-dessous :
    
    Analyse détaillée:
    (Expliquez ici comment les informations système (de base ET avancées si fournies) pourraient être liées au problème, ou une analyse générale si aucun problème spécifique n'est décrit. Soyez technique et précis. Si des informations avancées sont présentes, intégrez-les explicitement dans votre analyse.)
    
    Causes Potentielles:
    (Listez ici les causes probables du problème, en vous basant sur toutes les informations disponibles. Chaque cause sur une nouvelle ligne.)
    
    Solutions Suggérées:
    (Proposez ici des étapes concrètes pour résoudre le problème, en tenant compte de toutes les informations. Chaque solution sur une nouvelle ligne. Soyez précis et donnez des conseils pratiques.)

    Ne répétez PAS la description du problème ou l'intégralité des informations système brutes dans votre réponse, concentrez-vous UNIQUEMENT sur le diagnostic structuré comme demandé.
  `;

  try {
    console.log('[ai.service]: Envoi de la requête à Gemini AI...');
    const result = await model.generateContentStream([prompt]); 
    
    let fullResponse = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
    }
    
    console.log('[ai.service]: Réponse complète reçue de Gemini AI.');
    // console.log('[ai.service]: Réponse brute de Gemini:', fullResponse);

    const report = parseGeminiResponseToReport(fullResponse, userProblem);
    console.log('[ai.service]: Fin du traitement Gemini AI. Rapport généré.');
    return report;

  } catch (error: unknown) {
    console.error('[ai.service]: Erreur lors de l\'appel à Gemini AI:', error);
    let errorMessage = 'Erreur inconnue lors de la communication avec Gemini.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const geminiError = error as { response?: { promptFeedback?: any } };
      if (geminiError.response && geminiError.response.promptFeedback) {
        console.error('[ai.service]: Gemini Prompt Feedback:', JSON.stringify(geminiError.response.promptFeedback, null, 2));
      }
    }
    
    console.warn('[ai.service]: Utilisation du rapport simulé en raison d\'une erreur Gemini.');
    return generateSimulatedReport(systemInfo, userProblem, `Erreur Gemini: ${errorMessage}`, advancedSystemInfo);
  }
};

const generateSimulatedReport = (systemInfo: SystemInfo, userProblem?: string, errorDetails?: string, advancedSystemInfo?: string): Report => {
  console.log('[ai.service]: Génération d\'un rapport simulé (fallback).');
  
  const parseMemory = (memValueStr: string | number | undefined): number | null => {
    if (memValueStr === undefined || memValueStr === null) return null;
    if (typeof memValueStr === 'number') return memValueStr;
    const cleanedStr = String(memValueStr).trim().toUpperCase();
    if (cleanedStr === "N/A" || cleanedStr === "") return null;
    const parsed = parseFloat(cleanedStr);
    return isNaN(parsed) ? null : parsed;
  };

  const totalMemory = parseMemory(systemInfo.totalMemoryMB);
  const freeMemory = parseMemory(systemInfo.freeMemoryMB);

  let primaryIpAddress = 'N/A';
  if (systemInfo.networkInterfaces) {
    for (const ifaceName in systemInfo.networkInterfaces) {
      const ifaceDetails = systemInfo.networkInterfaces[ifaceName];
      if (ifaceDetails) {
        const ipv4 = ifaceDetails.find(details => details.family === 'IPv4' && !details.internal);
        if (ipv4 && ipv4.address) {
          primaryIpAddress = ipv4.address;
          break;
        }
      }
    }
  }
  
  const cpuModel = systemInfo.cpus && systemInfo.cpus.length > 0 && systemInfo.cpus[0].model ? systemInfo.cpus[0].model : 'N/A';
  const cpuSpeed = systemInfo.cpus && systemInfo.cpus.length > 0 && systemInfo.cpus[0].speed ? systemInfo.cpus[0].speed : 'N/A';

  let memoryStatus = 'Normal';
  if (freeMemory !== null) {
    if (totalMemory !== null && totalMemory > 0 && (freeMemory / totalMemory) < 0.1) {
        memoryStatus = 'Critiquement Faible';
    } else if (freeMemory < 1024) { 
        memoryStatus = 'Faible';
    }
  }
  
  const advancedInfoSummary = advancedSystemInfo && advancedSystemInfo.trim().length > 0 
    ? 'Des informations avancées ont été fournies mais non analysées par cette simulation.' 
    : 'Aucune information avancée fournie.';

  const report: Report = {
    summary: `Diagnostic SIMULÉ basé sur le problème: "${userProblem || 'Non spécifié'}" et les informations système. ${errorDetails ? `NOTE: ${errorDetails}` : ''} ${advancedInfoSummary}`,
    analysis: [
      {
        component: 'CPU',
        status: 'Normal (simulation)', 
        details: `Modèle: ${cpuModel}. Vitesse: ${cpuSpeed}MHz. Usage/Température: Non collectés.`,
        recommendation: 'Vérifier les processus CPU si lenteurs.',
      },
      {
        component: 'Mémoire (RAM)',
        status: memoryStatus,
        details: `Totale: ${systemInfo.totalMemoryMB || 'N/A'}MB. Libre: ${systemInfo.freeMemoryMB || 'N/A'}MB.`,
        recommendation: (memoryStatus === 'Faible' || memoryStatus === 'Critiquement Faible') ? 'Fermer apps ou upgrade RAM.' : 'OK.',
      },
      {
        component: 'Réseau',
        status: 'Normal (simulation)', 
        details: `IP principale: ${primaryIpAddress}. Ping: Non collecté.`,
        recommendation: 'Vérifier connexion si problèmes réseau.',
      },
      {
        component: 'Informations Avancées (Windows .bat)',
        status: advancedSystemInfo && advancedSystemInfo.trim().length > 0 ? 'Fournies (simulation)' : 'Non fournies (simulation)',
        details: advancedSystemInfo && advancedSystemInfo.trim().length > 0 ? 'Les données du script .bat ont été reçues mais ne sont pas traitées en détail par ce rapport simulé.' : 'Aucune donnée du script .bat n\'a été soumise.',
        recommendation: 'Si fournies, ces informations seraient normalement analysées par l\'IA.'
      }
    ],
    potentialCauses: [
      'Ceci est un rapport simulé car l\'IA n\'a pas pu être contactée ou a retourné une erreur.',
      'Veuillez vérifier la clé API GEMINI_API_KEY et la connectivité réseau du backend.',
      userProblem && userProblem.toLowerCase().includes('lent') ? 'Logiciels malveillants (simulation).' : 'Cause spécifique non déterminée (simulation).',
    ],
    suggestedSolutions: [
      'Assurez-vous que la variable d\'environnement GEMINI_API_KEY est correctement configurée dans le fichier backend/.env.',
      'Vérifiez les logs du backend pour plus de détails sur l\'erreur de connexion à l\'IA.',
      'Redémarrez le serveur backend.',
      'Consultez la documentation de Gemini pour les codes d\'erreur spécifiques si disponibles.',
    ],
    confidenceScore: 0.10,
    generatedAt: new Date().toISOString(),
  };
  return report;
};
