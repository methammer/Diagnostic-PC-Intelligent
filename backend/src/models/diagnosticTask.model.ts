export enum DiagnosticTaskStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export interface CpuInfo {
  model: string;
  speed: number;
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
}

export interface NetworkInterfaceInfo {
  address: string;
  netmask: string;
  family: string;
  mac: string;
  internal: boolean;
  cidr: string | null;
}

export interface UserInfo {
  username: string;
  uid: number;
  gid: number;
  shell: string | null;
  homedir: string;
}

export interface SystemInfo {
  timestamp: string;
  platform: string;
  release: string;
  arch: string;
  hostname: string;
  userInfo?: UserInfo; // Made optional as it might not always be available
  uptime: number;
  totalMemoryMB: string | number; // Agent sends string "N/A" or number
  freeMemoryMB: string | number;  // Agent sends string "N/A" or number
  cpuCount: number;
  cpus?: CpuInfo[]; // Made optional as it might not always be available
  networkInterfaces?: { [key: string]: NetworkInterfaceInfo[] }; // Made optional
  diskInfo?: any; // Keep as any for now, or define more strictly if structure is known
}

export interface DiagnosticTask {
  id: string;
  status: DiagnosticTaskStatus;
  submittedAt: Date;
  completedAt?: Date;
  problemDescription?: string;
  systemInfo?: SystemInfo; // Use the defined SystemInfo interface
  report?: any; 
  error?: string;
}
