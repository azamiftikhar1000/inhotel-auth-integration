const axios = require('axios');

// Default API endpoints (you may need to adjust these based on your actual API structure)
const API_ENDPOINTS = {
  sandbox: 'https://sandbox-api.picaos.com',
  live: 'https://platform-backend.inhotel.io',
  default: 'https://platform-backend.inhotel.io'
};

async function fetchAssistantTools(assistantId, environment = 'live', secret = null) {
  if (!assistantId) {
    console.log('No assistant_id provided, returning empty tools array');
    return {
      success: true,
      tools: [],
      message: 'No assistant_id provided'
    };
  }

  try {
    // Determine the API endpoint based on environment
    const baseUrl = API_ENDPOINTS[environment] || API_ENDPOINTS.default;
    const toolsEndpoint = `${baseUrl}/v1/public/assistants/${assistantId}/tools`;

    console.log(`Fetching tools for assistant_id: ${assistantId} from ${toolsEndpoint}`);

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
    };

    // Add authentication header if secret is provided
    if (secret) {
      headers['x-pica-secret'] = secret;
    }

    const response = await axios({
      method: 'GET',
      url: toolsEndpoint,
      headers,
      timeout: 10000, // 10 second timeout
    });

    console.log(`Successfully fetched ${response.data?.length || 0} tools for assistant ${assistantId}`);

    return {
      success: true,
      tools: response.data || [],
      assistant_id: assistantId,
      environment
    };

  } catch (error) {
    console.error(`Error fetching tools for assistant ${assistantId}:`, error.message);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data;
      
      console.error('API Error Details:', {
        status,
        data: errorData,
        url: error.config?.url
      });

      return {
        success: false,
        tools: [],
        error: {
          message: errorData?.message || error.message,
          status,
          details: errorData
        },
        assistant_id: assistantId,
        environment
      };
    }

    return {
      success: false,
      tools: [],
      error: {
        message: error.message,
        status: 'unknown'
      },
      assistant_id: assistantId,
      environment
    };
  }
}

// Alternative endpoint structure if the tools API follows a different pattern
async function fetchAssistantToolsAlternative(assistantId, environment = 'live', secret = null) {
  if (!assistantId) {
    return {
      success: true,
      tools: [],
      message: 'No assistant_id provided'
    };
  }

  try {
    const baseUrl = API_ENDPOINTS[environment] || API_ENDPOINTS.default;
    // Try alternative endpoint patterns
    const alternativeEndpoints = [
      `${baseUrl}/v1/assistants/${assistantId}/tools`,
      `${baseUrl}/public/v1/assistants/${assistantId}/tools`,
      `${baseUrl}/api/v1/assistants/${assistantId}/tools`,
      `${baseUrl}/v1/tools?assistant_id=${assistantId}`
    ];

    for (const endpoint of alternativeEndpoints) {
      try {
        console.log(`Trying alternative endpoint: ${endpoint}`);
        
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        };

        if (secret) {
          headers['x-pica-secret'] = secret;
        }

        const response = await axios({
          method: 'GET',
          url: endpoint,
          headers,
          timeout: 5000,
        });

        console.log(`Success with alternative endpoint: ${endpoint}`);
        return {
          success: true,
          tools: response.data || [],
          assistant_id: assistantId,
          environment,
          endpoint_used: endpoint
        };

      } catch (endpointError) {
        console.log(`Failed with endpoint ${endpoint}:`, endpointError.message);
        continue; // Try next endpoint
      }
    }

    throw new Error('All alternative endpoints failed');

  } catch (error) {
    console.error(`All endpoints failed for assistant ${assistantId}:`, error.message);
    return {
      success: false,
      tools: [],
      error: {
        message: 'All API endpoints failed',
        details: error.message
      },
      assistant_id: assistantId,
      environment
    };
  }
}

module.exports = {
  fetchAssistantTools,
  fetchAssistantToolsAlternative
}; 