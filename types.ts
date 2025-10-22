
export enum Role {
  USER = 'user',
  DAMIEN = 'damien',
}

export enum View {
  CHAT = 'chat',
  DASHBOARD = 'dashboard'
}

export interface AppFile {
  name: string;
  type: string;
  url: string;
  file: File;
}

export interface Message {
  role: Role;
  content: string;
  file?: AppFile;
  timestamp: Date;
}

export interface AnalyticsEntry {
  timestamp: Date;
  command: string;
  response: string;
  type: 'text' | 'voice' | 'file';
}
