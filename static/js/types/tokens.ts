export interface Token {
  id: string;
  token: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmbedTokenRecord {
  token: string;
  destination?: string;
  payload?: Record<string, any>;
  connectionId?: string;
  integrationId?: string;
  expiresAt?: string;
  features?: Array<{
    key: string;
    value: string;
  }>;
  sessionId?: string;
  linkSettings?: {
    connectedPlatforms?: Array<any>;
    eventIncToken?: string;
  };
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