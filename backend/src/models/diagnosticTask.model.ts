// Cette interface SystemInfo structurée n'est plus directement remplie par l'agent.
// Elle pourrait être utilisée si le backend parse le texte brut en une structure,
// ou si d'autres sources de données structurées sont ajoutées à l'avenir.
// Pour l'instant, nous conservons sa définition au cas où, mais elle n'est pas activement utilisée
// pour les données du script .bat.
export interface SystemInfo {
  osInfo?: {
    platform?: string;
    distro?: string;
    release?: string;
    kernel?: string;
    arch?: string;
    hostname?: string;
    codepage?: string;
    logonServer?: string;
  };
  hardwareInfo?: {
    cpu?: { manufacturer?: string; brand?: string; speed?: number; cores?: number; processors?: number };
    memory?: { total?: number; free?: number; used?: number; active?: number; available?: number };
    disks?: Array<{ name?: string; type?: string; size?: number; used?: number; available?: number; mount?: string }>;
    graphics?: Array<{ model?: string; vendor?: string; vram?: number }>;
    bios?: { vendor?: string; version?: string; releaseDate?: string; };
    motherboard?: { manufacturer?: string; model?: string; version?: string; };
  };
  networkInfo?: {
    interfaces?: Array<{ name?: string; ip4?: string; ip6?: string; mac?: string; internal?: boolean }>;
    gateway?: string;
    dnsServers?: string[];
  };
  userInfo?: {
    username?: string;
    shell?: string;
  };
  softwareInfo?: {
    installedApps?: Array<{ name?: string; version?: string; installDate?: string }>;
    runningProcesses?: Array<{ name?: string; pid?: number; ppid?: number; cpu?: number; memory?: number }>;
  };
  // Potentiellement d'autres sections comme 'securityInfo', 'performanceMetrics', etc.
}


export enum DiagnosticTaskStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface AIReport {
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
  error?: string;
}

export interface DiagnosticTask {
  id: string;
  status: DiagnosticTaskStatus;
  submittedAt: Date;
  completedAt?: Date;
  problemDescription?: string;
  systemInfoRaw?: string; // Stocke la sortie brute du script .bat
  // systemInfo?: SystemInfo; // L'ancien champ pour les données JSON structurées, maintenant remplacé par systemInfoRaw
  report?: AIReport;
  error?: string;
}
