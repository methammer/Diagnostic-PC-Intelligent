import axios from 'axios';
import { DiagnosticTaskStatus } from '../../../backend/src/models/diagnosticTask.model'; // Ajustez le chemin si nécessaire

const apiClient = axios.create({
  baseURL: '/api', // Utilisera le proxy Vite
});

export interface SystemInfo {
  timestamp?: string;
  platform?: string;
  release?: string;
  arch?: string;
  hostname?: string;
  userInfo?: { username?: string; homedir?: string };
  uptime?: number;
  totalMemoryMB?: string | number;
  freeMemoryMB?: string | number;
  cpuCount?: number;
  cpus?: { model: string; speed: number }[];
  networkInterfaces?: Record<string, any[]>;
  diskInfo?: string | Record<string, any>;
}


export interface SubmitDiagnosticPayload {
  problemDescription?: string;
  systemInfo?: SystemInfo; // Pour l'instant, on ne l'enverra pas depuis le frontend
}

export interface SubmitDiagnosticResponse {
  message: string;
  taskId: string;
}

export interface DiagnosticReport {
  taskId: string;
  status: DiagnosticTaskStatus;
  submittedAt: string;
  completedAt?: string;
  problemDescription?: string;
  diagnosticReport?: any; // Le rapport de l'IA
  errorDetails?: string;
  message?: string; // Pour les statuts PENDING/PROCESSING
}

export const submitDiagnostic = async (payload: SubmitDiagnosticPayload): Promise<SubmitDiagnosticResponse> => {
  const { data } = await apiClient.post<SubmitDiagnosticResponse>('/collecte', payload);
  return data;
};

export const getDiagnosticReport = async (taskId: string): Promise<DiagnosticReport> => {
  const { data } = await apiClient.get<DiagnosticReport>(`/report/${taskId}`);
  return data;
};
