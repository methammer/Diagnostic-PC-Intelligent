export enum DiagnosticTaskStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface DiagnosticTask {
  id: string;
  status: DiagnosticTaskStatus;
  submittedAt: Date;
  completedAt?: Date;
  problemDescription?: string;
  systemInfo?: any; // Peut être typé plus précisément plus tard
  report?: any; // Peut être typé plus précisément (par exemple, le type de retour de processWithAI)
  error?: string;
}
