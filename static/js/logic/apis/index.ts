import axios from "axios";
import { getEnvFromHost } from "../../helpers/getEnvFromHost";

// Secret API key for authentication
const API_SECRET = "sk_test_1_3pejYG_SdSxV9xkt5_GA8WoMsSnfBHvY1qpGhlX-6DKd9kyZO3ee9hWfjGWpt5dY0AzxvM51q6_45_Q6bJTWCTuax7yq4X96nhvB0uTwhhLlsxyJm02JqasmdeDVeHt08GxGPoiBc7I9u00-1EKOejw62kNO0M1EaEFqwaGXw1Y8IfFH";

export const apiRequest = async ({
  url,
  method,
  payload,
  headers,
}: {
  url: string;
  method: "POST" | "GET";
  payload: object;
  headers?: object;
}) => {
  try {
    console.log(`Making ${method} request to: ${url}`);
    const { data } = await axios({
      url,
      method,
      data: payload,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-pica-secret': API_SECRET,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      },
      withCredentials: false, // Disable sending cookies to avoid CORS preflight
      timeout: 10000, // 10 second timeout
    });
    
    console.log(`Success response from ${url}:`, data);
    return data;
  } catch (error) {
    console.error(`Error in API request to ${url}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Update domain to use http instead of https for localhost
const domains = {
  localhost: "https://platform-backend.inhotel.io",//"http://localhost:3005",
  development: "https://development-api.picaos.com",
  sandbox: "https://sandbox-api.picaos.com",
  production: "https://platform-backend.inhotel.io",
  default: "https://development-api.picaos.com",
  "": "https://platform-backend.inhotel.io",
};

const oldDomains = {
  localhost: "https://platform-backend.inhotel.io",//"http://localhost:3001", // Same as domains for consistency
  development: "https://development-api.picaos.com",
  sandbox: "https://sandbox-api.picaos.com",
  production: "https://platform-backend.inhotel.io",
  default: "https://development-api.picaos.com",
  "": "https://platform-backend.inhotel.io",
};

export function getUrl(type: "old" | "new" = "new") {
  // Force localhost for debugging
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log("Using localhost API endpoint");
    return domains.localhost;
  }

  const env = getEnvFromHost();

  if (!env) {
    return domains.development;
  }
  const domain = type === "old" ? oldDomains[env] : domains[env];
  return domain ?? domains.development;
}

export const path = getUrl();
// export const oldPath = getUrl("old");
export const oldPath="https://platform-backend.inhotel.io/"


// Log the API paths being used
console.log("API path:", path);
console.log("Old API path:", oldPath);


export const apiKeys = {
  "get.integration.definitions.list": `${oldPath}/public/v1/integration-definitions/list`,
  "connection.definition": `${path}/v1/public/connection-definitions`,
  "integration.create": `${oldPath}/public/v1/links/create-integration`,
  "connection.create": `${oldPath}/public/v1/event-links/create-embed-connection`,
  "track": `${path}/v1/public/mark`,
  "get.embed.token": `${oldPath}/public/v1/embed-tokens/get`,
  "update.embed.token": `${oldPath}/public/v1/embed-tokens/update`,
  'connection.oauth.definition': `${path}/v1/public/connection-oauth-definition-schema?limit=100`,
};

// Log all API endpoints
console.log("API endpoints:", apiKeys);

export const remoteKeys = {
  getIntegrationDefinitions: "integration.definitions.get",
  listIntegrationDefinitions: "integration.definitions.list",
  getConnectionDefinition: "connection.definition.get",
  listConnectionDefinitions: "connection.definitions.list",
  getEmbedToken: "embed.token.get",
  updateEmbedToken: "embed.token.update",
  getConnectionOauthDefinition: "connection.oauth.definition.get",
};
