import { apiKeys, apiRequest } from ".";

export const getConnectionOauthDefinitionApi = () => {
    return apiRequest({
      method: 'GET',
      url: `${apiKeys['connection.oauth.definition']}`,
      payload: {},
    });
  };