export interface Link {
  id: string;
  name: string;
  description?: string;
  url?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConnectionPlatform {
  id: string;
  name: string;
  platform: string;
  feature?: string;
  icon?: string;
  description?: string;
}

export interface CreateConnectionProps {
  name: string;
  description?: string;
  integrationId: string;
  credentials: Record<string, any>;
  platformVersion?: string;
  connectionDefinitionId?: string;
  environment?: string;
  platform?: string;
  ownership?: string;
  linkToken?: string;
  authFormData?: { [K: string]: unknown };
  type?: string;
  linkHeaders?: Record<string, unknown>;
}

export interface CreateIntegrationProps {
  name: string;
  description?: string;
  fields?: Record<string, any>[];
  icon?: string;
  linkToken?: string;
  authFormData?: { [K: string]: unknown };
  integrationDefinitionId?: string;
}

export interface EventLinkTokenProps {
  integrationId: string;
  connectionId?: string;
  redirectUri?: string;
  tokenExpiryMs?: number;
}

export interface LinkTokenProps {
  integrationId: string;
  connectionId?: string;
  redirectUri?: string;
  tokenExpiryMs?: number;
}

export interface LinkResponse {
  success: boolean;
  data?: Link;
  error?: string;
}

export interface LinksResponse {
  success: boolean;
  data?: Link[];
  error?: string;
} 