import axios from 'axios';
import { DiagnosticTaskStatus } from '../../../backend/src/models/diagnosticTask.model'; // Ajustez si le chemin partagé est différent

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Updated to reflect that systemInfoText is sent
export interface SubmitDiagnosticPayload {
  problemDescription: string;
  systemInfoText: string; // Changed from systemInfo: any
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
  diagnosticReport?: any; // Structure from AI service
  errorDetails?: string;
  message?: string; // For PENDING/PROCESSING states
}

export const submitDiagnostic = async (payload: SubmitDiagnosticPayload): Promise<SubmitDiagnosticResponse> => {
  try {
    // console.log('[apiClient] Submitting diagnostic with payload:', payload);
    const response = await axios.post<SubmitDiagnosticResponse>(`${API_BASE_URL}/collecte`, payload);
    return response.data;
  } catch (error) {
    console.error('[apiClient] Error submitting diagnostic:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw error; // Re-throw to be handled by the caller, preserving response details
    }
    throw new Error('Network error or server unavailable during diagnostic submission.');
  }
};

export const getDiagnosticReport = async (taskId: string): Promise<DiagnosticReport> => {
  try {
    const response = await axios.get<DiagnosticReport>(`${API_BASE_URL}/diagnostic/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`[apiClient] Error fetching report for task ${taskId}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      throw error; // Re-throw to be handled by the caller
    }
    throw new Error(`Network error or server unavailable while fetching report for task ${taskId}.`);
  }
};
