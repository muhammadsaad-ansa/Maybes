export type NavigationTab = 
  | 'dashboard' 
  | 'database' 
  | 'table-editor' 
  | 'sql-editor' 
  | 'auth' 
  | 'storage' 
  | 'api-manager' 
  | 'settings';

export interface ColumnDefinition {
  name: string;
  type: 'uuid' | 'text' | 'integer' | 'boolean' | 'timestamp' | 'jsonb' | 'numeric';
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  defaultValue?: string;
}

export interface TableDefinition {
  id: string;
  name: string;
  schema: string;
  rowCount: number;
  size: string;
  columns: ColumnDefinition[];
  rows: Record<string, any>[];
  rlsEnabled: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  provider: 'email' | 'google' | 'github';
  createdAt: string;
  lastSignIn: string;
  status: 'active' | 'banned' | 'unverified';
  role: 'admin' | 'moderator' | 'user';
}

export interface StorageBucket {
  id: string;
  name: string;
  public: boolean;
  fileCount: number;
  size: string;
  createdAt: string;
}

export interface StorageFile {
  id: string;
  bucketId: string;
  name: string;
  size: string;
  mimeType: string;
  createdAt: string;
  url: string;
}

export interface SqlQueryHistory {
  id: string;
  query: string;
  executedAt: string;
  durationMs: number;
  status: 'success' | 'error';
  rowsAffected?: number;
  error?: string;
}

export interface WebhookLog {
  id: string;
  event: string;
  url: string;
  status: number;
  duration: string;
  timestamp: string;
}
