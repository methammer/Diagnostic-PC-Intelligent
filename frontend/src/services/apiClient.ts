import axios from 'axios';
import { DiagnosticTaskStatus } from '../types/diagnosticTaskStatus'; 

// Structure pour les données envoyées au backend
export interface SubmitDiagnosticPayload {
  problemDescription: string;
  systemInfoText?: string; // Texte brut du script .bat
}

// Structure pour la réponse de soumission
export interface SubmitDiagnosticResponse {
  message: string;
  taskId: string;
}

// Structure pour le rapport de diagnostic complet reçu du backend
export interface DiagnosticReport {
  taskId: string;
  status: DiagnosticTaskStatus;
  submittedAt: string;
  completedAt?: string;
  problemDescription?: string;
  diagnosticReport?: { // Contenu de l'analyse IA
    summary: string;
    analysis: Array<{
      component: string;
      status: string;
      details: string;
      recommendation: string;
    }>;
    potentialCauses: string[];
    suggestedSolutions: string[];
    confidenceScore: number;
    generatedAt: string;
    error?: string; // En cas d'erreur spécifique de l'IA
  };
  errorDetails?: string; // Erreur générale de la tâche
  message?: string; // Message pour les statuts PENDING/PROCESSING
}


const apiClient = axios.create({
  baseURL: '/api', 
});

export const submitDiagnostic = async (payload: SubmitDiagnosticPayload): Promise<SubmitDiagnosticResponse> => {
  const response = await apiClient.post<SubmitDiagnosticResponse>('/collecte', payload);
  return response.data;
};

export const getDiagnosticReport = async (taskId: string): Promise<DiagnosticReport> => {
  const response = await apiClient.get<DiagnosticReport>(`/diagnostic/${taskId}`);
  return response.data;
};
