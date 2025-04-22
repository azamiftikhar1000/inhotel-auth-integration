export interface Connection {
  id: string;
  _id?: string; // For backward compatibility
  name: string;
  description?: string;
  integrationId?: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  updatedAt?: string;
  credentials?: Record<string, any>;
  platformVersion?: string;
  connectionDefinitionId?: string;
  environment?: string;
  platform?: string;
  ownership?: {
    userId: string;
  };
  key?: string;
}

export interface ConnectionResponse {
  success: boolean;
  data?: Connection;
  error?: string;
}

export interface ConnectionsResponse {
  success: boolean;
  data?: Connection[];
  error?: string;
} 