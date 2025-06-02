import { apiRequest } from ".";

export interface AssistantLookupResult {
  success: boolean;
  assistant_id: string | null;
  user_id?: string | null;
  environment?: string;
  tools: any[];
  tools_fetch_success?: boolean;
  tools_error?: any;
  error?: string;
  metadata?: {
    step_completed: string;
    mongodb_lookup_success?: boolean;
    tools_api_success?: boolean;
    tools_count?: number;
    endpoint_used?: string;
    timestamp: string;
    secret_type?: string;
    [key: string]: any;
  };
}

export interface ExtractSecretResult {
  success: boolean;
  secret: string | null;
  has_secret: boolean;
  error?: string;
  details?: string;
}

/**
 * Look up assistant and fetch tools using base64 data or secret
 */
export const lookupAssistantAndTools = async (params: {
  base64Data?: string;
  secret?: string;
  options?: {
    retryAlternative?: boolean;
    includeMetadata?: boolean;
  };
}): Promise<AssistantLookupResult> => {
  try {
    const response = await fetch('/api/assistant/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in lookupAssistantAndTools:', error);
    return {
      success: false,
      assistant_id: null,
      tools: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Extract X-Pica-Secret from base64 data
 */
export const extractSecret = async (base64Data: string): Promise<ExtractSecretResult> => {
  try {
    const response = await fetch('/api/assistant/extract-secret', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error in extractSecret:', error);
    return {
      success: false,
      secret: null,
      has_secret: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * React hook-compatible version of lookupAssistantAndTools
 */
export const lookupAssistantAndToolsApi = (params: {
  base64Data?: string;
  secret?: string;
  options?: {
    retryAlternative?: boolean;
    includeMetadata?: boolean;
  };
}) => {
  return lookupAssistantAndTools(params);
};

/**
 * React hook-compatible version of extractSecret
 */
export const extractSecretApi = (base64Data: string) => {
  return extractSecret(base64Data);
};

// Utility function to process base64 data from URL params directly
export const processUrlParamsForAssistant = async (): Promise<AssistantLookupResult> => {
  try {
    const queryParameters = new URLSearchParams(
      window?.location?.href.split("?")[1]
    );

    const base64Data = queryParameters.get("data");
    
    if (!base64Data) {
      return {
        success: false,
        assistant_id: null,
        tools: [],
        error: 'No base64 data found in URL parameters'
      };
    }

    return await lookupAssistantAndTools({ 
      base64Data,
      options: { 
        retryAlternative: true, 
        includeMetadata: true 
      }
    });
  } catch (error) {
    console.error('Error in processUrlParamsForAssistant:', error);
    return {
      success: false,
      assistant_id: null,
      tools: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 