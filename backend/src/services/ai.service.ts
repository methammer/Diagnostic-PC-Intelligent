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

// const generationConfig = { // Not explicitly used in the current generateContentStream call
//   temperature: 0.7,
//   topK: 1,
//   topP: 1,
//   maxOutputTokens: 2048,
// };

// const safetySettings = [ // Not explicitly used in the current generateContentStream call
//   { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//   { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//   { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
//   { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
// ];

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
}

const formatSystemInfoForPrompt = (systemInfo: SystemInfo): string => {
  let formatted = "Informations Système Collectées:\n";
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
  formatted += `- Informations Disque: ${systemInfo.diskInfo || 'Non collecté par l\'agent.'}\n`;
  return formatted;
};

const parseGeminiResponseToReport = (geminiResponse: string, userProblem?: string): Report => {
  const report: Report = {
    summary: `Diagnostic IA basé sur le problème: "${userProblem || 'Non spécifié'}" et les informations système.`,
    analysis: [],
    potentialCauses: [],
    suggestedSolutions: [],
    confidenceScore: 0.85, // Default confidence, can be adjusted
    generatedAt: new Date().toISOString(),
  };

  const lines = geminiResponse.split(/\\n|\n/); // Handle both literal \n and actual newlines
  let currentSection = '';

  lines.forEach(line => {
    const cleanedLine = line.trim();
    if (cleanedLine.toLowerCase().startsWith('analyse:') || cleanedLine.toLowerCase().startsWith('analyse détaillée:')) {
      currentSection = 'analysis';
      if (cleanedLine.length > 'analyse détaillée:'.length) { // Capture text on the same line as the header
        report.analysis.push({ component: 'Général', status: 'Selon IA', details: cleanedLine.substring(cleanedLine.indexOf(':') + 1).trim(), recommendation: '' });
      }
      return;
    } else if (cleanedLine.toLowerCase().startsWith('causes potentielles:') || cleanedLine.toLowerCase().startsWith('causes possibles:')) {
      currentSection = 'potentialCauses';
      if (cleanedLine.length > 'causes potentielles:'.length) {
         report.potentialCauses.push(cleanedLine.substring(cleanedLine.indexOf(':') + 1).trim());
      }
      return;
    } else if (cleanedLine.toLowerCase().startsWith('solutions suggérées:') || cleanedLine.toLowerCase().startsWith('recommandations:') || cleanedLine.toLowerCase().startsWith('étapes de résolution:')) {
      currentSection = 'suggestedSolutions';
       if (cleanedLine.length > 'solutions suggérées:'.length) {
         report.suggestedSolutions.push(cleanedLine.substring(cleanedLine.indexOf(':') + 1).trim());
      }
      return;
    }

    if (cleanedLine.length > 0) {
      if (currentSection === 'analysis') {
        report.analysis.push({ component: 'Général', status: 'Selon IA', details: cleanedLine, recommendation: '' });
      } else if (currentSection === 'potentialCauses') {
        report.potentialCauses.push(cleanedLine);
      } else if (currentSection === 'suggestedSolutions') {
        report.suggestedSolutions.push(cleanedLine);
      }
    }
  });
  
  if (report.analysis.length === 0 && report.potentialCauses.length === 0 && report.suggestedSolutions.length === 0) {
    report.analysis.push({
        component: 'IA Résumé',
        status: 'Traitement IA',
        details: geminiResponse, 
        recommendation: 'Veuillez lire attentivement la réponse de l\'IA ci-dessus. La structuration automatique a peut-être échoué.'
    });
  }
  return report;
};


export const processWithAI = async (systemInfo: SystemInfo, userProblem?: string): Promise<Report> => {
  console.log('[ai.service]: Début du traitement avec Gemini AI.');
  
  if (!model || !genAI) {
    console.error('[ai.service]: Gemini AI SDK non initialisé (API KEY manquante ou invalide?). Utilisation du fallback simulé.');
    return generateSimulatedReport(systemInfo, userProblem);
  }

  const formattedSysInfo = formatSystemInfoForPrompt(systemInfo);
  const problemDesc = userProblem || "L'utilisateur n'a pas fourni de description spécifique du problème, mais a soumis des informations système pour analyse générale.";

  const prompt = `
    Vous êtes un expert en diagnostic informatique. Analysez la description du problème suivante et les informations système fournies.
    Générez un rapport de diagnostic complet en français. Le rapport doit inclure :
    1.  Une section "Analyse détaillée:" : Expliquez comment les informations système pourraient être liées au problème (ou une analyse générale si aucun problème spécifique n'est décrit).
    2.  Une section "Causes Potentielles:" : Listez les causes probables du problème.
    3.  Une section "Solutions Suggérées:" : Proposez des étapes concrètes pour résoudre le problème. Soyez précis et donnez des conseils pratiques.

    Description du problème par l'utilisateur:
    "${problemDesc}"

    ${formattedSysInfo}

    Formattez votre réponse clairement avec des titres pour chaque section (par exemple, "Analyse détaillée:", "Causes Potentielles:", "Solutions Suggérées:").
    Ne répétez pas la description du problème ou les informations système dans votre réponse, concentrez-vous sur le diagnostic.
    Chaque cause potentielle et chaque solution suggérée doit être sur une nouvelle ligne.
  `;

  try {
    console.log('[ai.service]: Envoi de la requête à Gemini AI...');
    // Note: generationConfig and safetySettings are not directly passed to generateContentStream here.
    // If needed, they should be part of the model initialization or specific request options.
    // For simplicity, we're using default settings for the stream.
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

  } catch (error: unknown) { // Type error as unknown
    console.error('[ai.service]: Erreur lors de l\'appel à Gemini AI:', error);
    let errorMessage = 'Erreur inconnue lors de la communication avec Gemini.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Check if error is an object and has response property (basic check for Gemini error structure)
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const geminiError = error as { response?: { promptFeedback?: any } }; // Type assertion
      if (geminiError.response && geminiError.response.promptFeedback) {
        console.error('[ai.service]: Gemini Prompt Feedback:', JSON.stringify(geminiError.response.promptFeedback, null, 2));
      }
    }
    
    console.warn('[ai.service]: Utilisation du rapport simulé en raison d\'une erreur Gemini.');
    return generateSimulatedReport(systemInfo, userProblem, `Erreur Gemini: ${errorMessage}`);
  }
};

const generateSimulatedReport = (systemInfo: SystemInfo, userProblem?: string, errorDetails?: string): Report => {
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
    } else if (freeMemory < 1024) { // Assuming freeMemory is in MB
        memoryStatus = 'Faible';
    }
  }

  const report: Report = {
    summary: `Diagnostic SIMULÉ basé sur le problème: "${userProblem || 'Non spécifié'}" et les informations système. ${errorDetails ? `NOTE: ${errorDetails}` : ''}`,
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
