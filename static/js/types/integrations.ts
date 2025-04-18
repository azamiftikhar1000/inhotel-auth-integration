export interface IntegrationField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'textarea' | 'number' | 'switch';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean;
  description?: string;
}

export interface Integration {
  id: string;
  name: string;
  description?: string;
  fields?: IntegrationField[];
  icon?: string;
  status?: 'active' | 'inactive';
  platform?: string;
  feature?: string;
}

export interface Rules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
}

export interface ConnectionDefinition {
  id: string;
  name: string;
  description?: string;
  fields?: IntegrationField[];
  icon?: string;
  status?: 'active' | 'inactive';
}

export interface ConnectionDefinitions {
  data: ConnectionDefinition[];
}

export interface SubmitConnectionProps {
  name: string;
  description?: string;
  integrationId: string;
  credentials: Record<string, any>;
  platformVersion?: string;
  connectionDefinitionId?: string;
  environment?: string;
  platform?: string;
  ownership?: string;
}

export interface IntegrationResponse {
  success: boolean;
  data?: Integration;
  error?: string;
}

export interface IntegrationsResponse {
  success: boolean;
  data?: Integration[];
  error?: string;
} 