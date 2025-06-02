const { findUserAssistantMapping } = require('./mongodb');
const { fetchAssistantTools, fetchAssistantToolsAlternative } = require('./assistantApi');

/**
 * Assistant lookup only - just get assistant_id from MongoDB without fetching tools
 * @param {string} secret - The X-Pica-Secret value
 * @param {object} options - Additional options
 * @returns {object} - Result containing only assistant_id and user info
 */
async function lookupAssistantOnly(secret, options = {}) {
  const { includeMetadata = true } = options;
  
  try {
    console.log('=== Starting Assistant Lookup Only ===');
    console.log(`Processing secret: ${secret ? secret.substring(0, 20) + '...' : 'null'}`);

    // Step 1: Validate input
    if (!secret) {
      return {
        success: false,
        error: 'No X-Pica-Secret provided',
        assistant_id: null,
        metadata: includeMetadata ? {
          step_completed: 'validation',
          timestamp: new Date().toISOString()
        } : undefined
      };
    }

    // Step 2: Find assistant mapping in MongoDB
    console.log('Step 1: Looking up assistant mapping in MongoDB...');
    const mappingResult = await findUserAssistantMapping(secret);
    
    if (mappingResult.error) {
      return {
        success: false,
        error: `MongoDB lookup failed: ${mappingResult.error}`,
        assistant_id: null,
        metadata: includeMetadata ? {
          step_completed: 'mongodb_lookup',
          mongodb_error: mappingResult.error,
          timestamp: new Date().toISOString()
        } : undefined
      };
    }

    const { assistant_id, user_id, environment } = mappingResult;
    
    console.log(`Assistant lookup result: assistant_id=${assistant_id}, user_id=${user_id}, environment=${environment}`);

    // Step 3: Return just the assistant info
    const result = {
      success: true,
      assistant_id,
      user_id,
      environment,
      metadata: includeMetadata ? {
        step_completed: 'complete',
        mongodb_lookup_success: true,
        timestamp: new Date().toISOString(),
        secret_type: secret.startsWith('sk_test') ? 'test' : 'live'
      } : undefined
    };

    console.log('=== Assistant Lookup Only Complete ===');
    console.log(`Final result: assistant_id=${assistant_id}, success=${result.success}`);

    return result;

  } catch (error) {
    console.error('=== Assistant Lookup Only Failed ===');
    console.error('Unexpected error in lookupAssistantOnly:', error);

    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      assistant_id: null,
      metadata: includeMetadata ? {
        step_completed: 'error',
        error_details: error.message,
        timestamp: new Date().toISOString()
      } : undefined
    };
  }
}

/**
 * Main service function to process X-Pica-Secret and fetch associated tools
 * @param {string} secret - The X-Pica-Secret value extracted from base64Decoded data
 * @param {object} options - Additional options like retry alternative endpoints
 * @returns {object} - Result containing assistant_id, tools, and metadata
 */
async function processSecretAndFetchTools(secret, options = {}) {
  const { retryAlternative = true, includeMetadata = true, skipToolsFetch = false } = options;
  
  // If skipToolsFetch is true, just do the lookup
  if (skipToolsFetch) {
    return await lookupAssistantOnly(secret, { includeMetadata });
  }

  try {
    console.log('=== Starting Assistant Service Process ===');
    console.log(`Processing secret: ${secret ? secret.substring(0, 20) + '...' : 'null'}`);

    // Step 1: Validate input
    if (!secret) {
      return {
        success: false,
        error: 'No X-Pica-Secret provided',
        assistant_id: null,
        tools: [],
        metadata: includeMetadata ? {
          step_completed: 'validation',
          timestamp: new Date().toISOString()
        } : undefined
      };
    }

    // Step 2: Find assistant mapping in MongoDB
    console.log('Step 1: Looking up assistant mapping in MongoDB...');
    const mappingResult = await findUserAssistantMapping(secret);
    
    if (mappingResult.error) {
      return {
        success: false,
        error: `MongoDB lookup failed: ${mappingResult.error}`,
        assistant_id: null,
        tools: [],
        metadata: includeMetadata ? {
          step_completed: 'mongodb_lookup',
          mongodb_error: mappingResult.error,
          timestamp: new Date().toISOString()
        } : undefined
      };
    }

    const { assistant_id, user_id, environment } = mappingResult;
    
    console.log(`Step 1 Result: assistant_id=${assistant_id}, user_id=${user_id}, environment=${environment}`);

    // Step 3: Fetch tools using assistant_id
    console.log('Step 2: Fetching assistant tools...');
    let toolsResult = await fetchAssistantTools(assistant_id, environment, secret);

    // Step 4: If primary API call fails and retry is enabled, try alternative endpoints
    if (!toolsResult.success && retryAlternative && assistant_id) {
      console.log('Step 3: Primary API failed, trying alternative endpoints...');
      toolsResult = await fetchAssistantToolsAlternative(assistant_id, environment, secret);
    }

    // Step 5: Prepare final result
    const result = {
      success: true,
      assistant_id,
      user_id,
      environment,
      tools: toolsResult.tools || [],
      tools_fetch_success: toolsResult.success,
      metadata: includeMetadata ? {
        step_completed: 'complete',
        mongodb_lookup_success: true,
        tools_api_success: toolsResult.success,
        tools_count: (toolsResult.tools || []).length,
        endpoint_used: toolsResult.endpoint_used,
        timestamp: new Date().toISOString(),
        secret_type: secret.startsWith('sk_test') ? 'test' : 'live'
      } : undefined
    };

    if (toolsResult.error) {
      result.tools_error = toolsResult.error;
    }

    console.log('=== Assistant Service Process Complete ===');
    console.log(`Final result: assistant_id=${assistant_id}, tools_count=${result.tools.length}, success=${result.success}`);

    return result;

  } catch (error) {
    console.error('=== Assistant Service Process Failed ===');
    console.error('Unexpected error in processSecretAndFetchTools:', error);

    return {
      success: false,
      error: `Unexpected error: ${error.message}`,
      assistant_id: null,
      tools: [],
      metadata: includeMetadata ? {
        step_completed: 'error',
        error_details: error.message,
        timestamp: new Date().toISOString()
      } : undefined
    };
  }
}

/**
 * Extract X-Pica-Secret from base64 decoded data
 * @param {string} base64Data - The base64 encoded data from URL parameters
 * @returns {string|null} - The extracted X-Pica-Secret or null if not found
 */
function extractSecretFromBase64Data(base64Data) {
  try {
    if (!base64Data) {
      console.log('No base64 data provided');
      return null;
    }

    // Decode base64 data
    const decodedString = Buffer.from(base64Data, 'base64').toString('utf-8');
    console.log('Decoded base64 data successfully');

    // Parse JSON
    const decodedObject = JSON.parse(decodedString);
    console.log('Parsed decoded data as JSON');

    // Extract X-Pica-Secret from linkHeaders
    const secret = decodedObject?.linkHeaders?.['X-Pica-Secret'];
    
    if (secret) {
      console.log(`Extracted X-Pica-Secret: ${secret.substring(0, 20)}...`);
      return secret;
    } else {
      console.log('X-Pica-Secret not found in linkHeaders');
      return null;
    }

  } catch (error) {
    console.error('Error extracting secret from base64 data:', error.message);
    return null;
  }
}

/**
 * Complete workflow: Extract secret from base64 data and fetch tools
 * @param {string} base64Data - The base64 encoded data from URL parameters
 * @param {object} options - Options for processing
 * @returns {object} - Complete result with assistant_id, tools, and metadata
 */
async function processBase64DataAndFetchTools(base64Data, options = {}) {
  try {
    console.log('=== Starting Complete Workflow ===');
    
    // Step 1: Extract secret from base64 data
    const secret = extractSecretFromBase64Data(base64Data);
    
    if (!secret) {
      return {
        success: false,
        error: 'Could not extract X-Pica-Secret from base64 data',
        assistant_id: null,
        tools: [],
        metadata: options.includeMetadata ? {
          step_completed: 'secret_extraction',
          base64_provided: !!base64Data,
          timestamp: new Date().toISOString()
        } : undefined
      };
    }

    // Step 2: Process secret and fetch tools
    const result = await processSecretAndFetchTools(secret, options);
    
    console.log('=== Complete Workflow Finished ===');
    return result;

  } catch (error) {
    console.error('=== Complete Workflow Failed ===');
    console.error('Error in complete workflow:', error);

    return {
      success: false,
      error: `Workflow error: ${error.message}`,
      assistant_id: null,
      tools: [],
      metadata: options.includeMetadata ? {
        step_completed: 'workflow_error',
        error_details: error.message,
        timestamp: new Date().toISOString()
      } : undefined
    };
  }
}

module.exports = {
  processSecretAndFetchTools,
  extractSecretFromBase64Data,
  processBase64DataAndFetchTools,
  lookupAssistantOnly
}; 