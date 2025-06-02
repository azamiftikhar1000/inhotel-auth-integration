import React, { useState, useCallback } from 'react';
import { useMutation } from 'react-query';
import { 
  lookupAssistantAndTools, 
  extractSecret, 
  processUrlParamsForAssistant,
  AssistantLookupResult, 
  ExtractSecretResult 
} from '../apis/assistantApi';

export const useAssistantLookup = () => {
  const [result, setResult] = useState<AssistantLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mutation for assistant lookup
  const lookupMutation = useMutation(
    (params: {
      base64Data?: string;
      secret?: string;
      options?: {
        retryAlternative?: boolean;
        includeMetadata?: boolean;
      };
    }) => lookupAssistantAndTools(params),
    {
      onSuccess: (data) => {
        setResult(data);
        setError(data.success ? null : data.error || 'Unknown error');
      },
      onError: (error: any) => {
        setError(error?.message || 'Failed to lookup assistant');
        setResult(null);
      }
    }
  );

  // Mutation for secret extraction
  const extractSecretMutation = useMutation(
    (base64Data: string) => extractSecret(base64Data),
    {
      onError: (error: any) => {
        setError(error?.message || 'Failed to extract secret');
      }
    }
  );

  // Method to lookup assistant and tools
  const lookupAssistant = useCallback(async (params: {
    base64Data?: string;
    secret?: string;
    options?: {
      retryAlternative?: boolean;
      includeMetadata?: boolean;
    };
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await lookupMutation.mutateAsync(params);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [lookupMutation]);

  // Method to extract secret only
  const extractSecretOnly = useCallback(async (base64Data: string) => {
    try {
      const result = await extractSecretMutation.mutateAsync(base64Data);
      return result;
    } catch (error) {
      console.error('Extract secret error:', error);
      throw error;
    }
  }, [extractSecretMutation]);

  // Method to process URL parameters automatically
  const processUrlParams = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await processUrlParamsForAssistant();
      setResult(result);
      setError(result.success ? null : result.error || 'Unknown error');
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to process URL parameters';
      setError(errorMessage);
      setResult(null);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reset the state
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    // State
    result,
    isLoading: isLoading || lookupMutation.isLoading || extractSecretMutation.isLoading,
    error,
    
    // Methods
    lookupAssistant,
    extractSecretOnly,
    processUrlParams,
    reset,
    
    // Direct access to mutation objects if needed
    lookupMutation,
    extractSecretMutation,
    
    // Computed properties
    hasAssistantId: result?.assistant_id !== null && result?.assistant_id !== undefined,
    hasTools: result?.tools && result.tools.length > 0,
    toolsCount: result?.tools?.length || 0,
    environment: result?.environment,
    assistantId: result?.assistant_id,
    tools: result?.tools || [],
    metadata: result?.metadata
  };
};

// Simplified hook for just extracting secret
export const useSecretExtraction = () => {
  const extractSecretMutation = useMutation(
    (base64Data: string) => extractSecret(base64Data)
  );

  const extractSecretFromData = useCallback(async (base64Data: string): Promise<ExtractSecretResult> => {
    try {
      return await extractSecretMutation.mutateAsync(base64Data);
    } catch (error: any) {
      return {
        success: false,
        secret: null,
        has_secret: false,
        error: error?.message || 'Failed to extract secret'
      };
    }
  }, [extractSecretMutation]);

  return {
    extractSecret: extractSecretFromData,
    isLoading: extractSecretMutation.isLoading,
    error: extractSecretMutation.error,
    data: extractSecretMutation.data
  };
};

// Hook for automatic URL processing on component mount
export const useAutoAssistantLookup = (autoProcess = true) => {
  const assistantLookup = useAssistantLookup();
  const [hasProcessed, setHasProcessed] = useState(false);

  // Auto-process URL parameters when component mounts
  React.useEffect(() => {
    if (autoProcess && !hasProcessed && !assistantLookup.isLoading) {
      assistantLookup.processUrlParams()
        .then(() => setHasProcessed(true))
        .catch(() => setHasProcessed(true)); // Mark as processed even if failed
    }
  }, [autoProcess, hasProcessed, assistantLookup.isLoading]);

  return {
    ...assistantLookup,
    hasProcessed,
    reprocess: () => {
      setHasProcessed(false);
      return assistantLookup.processUrlParams().finally(() => setHasProcessed(true));
    }
  };
}; 