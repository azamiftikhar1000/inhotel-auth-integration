export interface Tool {
  id: string;
  logo: string;
  name: string;
  title: string;
  provider: string;
  shortDesc: string;
  longDesc: string;
  categories: string[];
  learnMore: string;
  actions?: ToolAction[];
}

export interface ToolAction {
  id?: string;
  title: string;
  tags?: string[];
  description?: string;
  connectionPlatform?: string;
}

export interface APIResponse<T> {
  status_code: number;
  data?: T;
  message?: string;
}

export interface KnowledgeAPIResponse {
  type: string;
  rows: ToolAction[];
}

export interface ToolCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToolConnect: (toolId: string, clientId?: string, scopes?: string, environment?: 'test' | 'live', connectionGuide?: string) => void;
  connectedPlatforms: any[];
  linkTokenEndpoint: string;
  linkHeaders?: Record<string, unknown>;
} 