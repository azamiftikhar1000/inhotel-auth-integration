export interface OAuthDefinition {
  id?: string;
  _id?: string;
  name?: string;
  connectionPlatform?: string;
  description?: string;
  frontend?: {
    authUrl?: string;
    tokenUrl?: string;
    clientId?: string;
    clientSecret?: string;
    scopes?: string[];
    redirectUri?: string;
    description?: string;
  };
  authUrl?: string;
  tokenUrl?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
  redirectUri?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface ConnectionOauthDefinitions {
  data: OAuthDefinition[];
}

export interface OAuthResponse {
  success: boolean;
  data?: OAuthDefinition;
  error?: string;
}
