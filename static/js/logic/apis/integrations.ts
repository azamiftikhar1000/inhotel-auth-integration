import { apiKeys, apiRequest } from ".";
import {
  CreateConnectionProps,
  CreateIntegrationProps,
} from "../../types/link";

export const listIntegrationDefinitions = (
  connectionType?: string,
  integrationTypes?: string[]
) =>
  apiRequest({
    url: apiKeys["get.integration.definitions.list"],
    method: "POST",
    payload: {
      pageSize: 100,
      query: integrationTypes
        ? {
            "frontend.spec.type": {
              $in: integrationTypes,
            },
            connectionTypes: {
              $in: [connectionType],
            },
          }
        : connectionType
        ? {
            connectionTypes: {
              $in: [connectionType],
            },
          }
        : {},
      fields: [
        "frontend",
        "_id",
        "connectionTypes",
        "settings",
        "schemas",
        "events",
      ],
    },
  });

export const createIntegration = ({
  linkToken,
  authFormData,
  integrationDefinitionId,
}: CreateIntegrationProps) =>
  apiRequest({
    url: apiKeys["integration.create"],
    method: "POST",
    payload: {
      linkToken,
      authFormData,
      integrationDefinitionId,
    },
  });

export const createConnection = ({
  linkToken,
  authFormData,
  connectionDefinitionId,
  type,
  linkHeaders,
}: CreateConnectionProps) =>
  apiRequest({
    url: apiKeys["connection.create"],
    method: "POST",
    payload: {
      linkToken,
      authFormData,
      connectionDefinitionId,
      type,
    },
    headers: linkHeaders,
  });

export const getIntegrationDefinition = (integrationId: string) =>
  apiRequest({
    url: apiKeys["get.integration.definitions.list"],
    method: "POST",
    payload: {
      query: {
        _id: integrationId,
      },
      fields: [
        "frontend",
        "_id",
        "connectionTypes",
        "settings",
        "schemas",
        "events",
      ],
    },
  });

export const getConnectionDefinition = (definitionId: string) =>
  apiRequest({
    url: `${apiKeys["connection.definition"]}?_id=${definitionId}`,
    method: "GET",
    payload: {},
  });
