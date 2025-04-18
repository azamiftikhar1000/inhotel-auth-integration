export interface Token {
  id: string;
  token: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmbedTokenRecord {
  embedToken: string;
  destination?: string;
  payload?: Record<string, any>;
  connectionId?: string;
  integrationId?: string;
  expiresAt?: string;
}

export interface TokenResponse {
  success: boolean;
  data?: Token;
  error?: string;
}

export interface TokensResponse {
  success: boolean;
  data?: Token[];
  error?: string;
} 