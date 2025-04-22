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
  key?: string;
  value?: string;
  title?: string;
  image?: string;
  connectionDefinitionId?: string;
  secret?: {
    clientId?: string;
  };
  scopes?: string;
  environment?: "test" | "live";
  connectionGuide?: string;
  active?: boolean;
}

export interface CreateConnectionProps {
  id?: string;
  name?: string;
  description?: string;
  active?: boolean;
  integrationId?: string;
  credentials?: Record<string, any>;
  platformVersion?: string;
  title?: string;
  connectionDefinitionId: string;
  secret?: string;
  scopes?: string[];
  environment?: string;
  platform?: string;
  ownership?: string;
  linkToken: string;
  authFormData?: { [K: string]: unknown };
  type?: string;
  linkHeaders?: Record<string, unknown>;
  connectionGuide?: string;
  image?: string;
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
  integrationId?: string;
  connectionId?: string;
  redirectUri?: string;
  tokenExpiryMs?: number;
  linkTokenEndpoint: string;
  linkHeaders?: Record<string, unknown>;
}

export interface LinkTokenProps {
  connectionDefinitionId: string;
  authFormData?: Record<string, unknown>;
  label?: string;
  group?: string;
  connectionType?: string;
  type?: string;
  linkTokenEndpoint?: string;
  linkHeaders?: Record<string, unknown>;
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