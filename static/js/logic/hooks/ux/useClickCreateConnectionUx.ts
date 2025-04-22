import {
  SubmitConnectionProps,
} from "../../../types/integrations";
import { useCreateConnection } from "../useCreateConnection";
import axios from "axios";
import { useState } from "react";
import { useTracking } from "../tracking/useTracking";
import { trackingConstants } from "../../../constants/tracking";
import { Connection } from "../../../types/connection";
import { useUpdateEmbedTokenUx } from "./useUpdateEmbedTokenUx";
import { useGetEmbedToken } from "../useGetEmbedToken";
import { EmbedTokenRecord } from "../../../types/tokens";
import { useCreateEventLinkToken } from "../useCreateEventLinkToken"

export const useClickCreateConnectionUx = () => {
  const { createIntegration, isLoading: isConnecting } = useCreateConnection();

  const { track } = useTracking();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [response, setResponse] = useState<Connection>();



  const { getEmbedToken } = useGetEmbedToken();

  const { createEventLinkToken } = useCreateEventLinkToken();

  const { trigger: updateEmbedToken } = useUpdateEmbedTokenUx();

  const [isLoading, setLoading] = useState<boolean>();
  const trigger = async ({
    authFormData,
    connectionDefinitionId,
    type,
    linkHeaders,
    sessionId,
    linkTokenEndpoint,
    setSessionId
  }: SubmitConnectionProps) => {
    try {

      setLoading(true);
      let token: EmbedTokenRecord[] = await getEmbedToken(sessionId);

      if (!token?.[0] || (token?.[0]?.expiresAt && new Date().getTime() > Number(token?.[0]?.expiresAt))) {
        const newToken: EmbedTokenRecord = await createEventLinkToken({
          linkTokenEndpoint,
          linkHeaders
        });

        token = [newToken];

      }
      
      const integration: Connection = await createIntegration({
        linkToken: token?.[0]?.linkSettings?.eventIncToken,
        authFormData,
        connectionDefinitionId,
        type,
        linkHeaders,
      });

      setLoading(false);

      window?.parent?.postMessage(
        {
          messageType: "LINK_SUCCESS",
          message: integration,
        },
        "*"
      );

      track(trackingConstants.CREATED_LINK_INTEGRATION, {
        _id: integration._id,
        platformVersion: integration.platformVersion,
        connectionDefinitionId: integration.connectionDefinitionId,
        name: integration.name,
        key: integration.key,
        environment: integration.environment,
        platform: integration.platform,
        userId: integration.ownership?.userId || "",
        createdAt: integration.createdAt,
        updatedAt: integration.updatedAt,
      }, integration.ownership?.userId || "");

      setResponse(integration);
      if (setSessionId) {
        setSessionId(token?.[0]?.sessionId || "");
      }
      if (updateEmbedToken) {
        await updateEmbedToken({sessionId: token?.[0]?.sessionId || ""});
      }
    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        const message =
          error?.response?.data?.message?.message ||
          error?.response?.data?.message ||
          "Something went wrong. Please try again later.";

        setErrorMessage(message);
        track(trackingConstants.TRACK_ERROR, {
          message,
        });
        window?.parent?.postMessage(
          { messageType: "LINK_ERROR", message },
          "*"
        );
      }
    }
  };

  return {
    trigger,
    isLoading: isConnecting || isLoading,
    errorMessage,
    response,
  };
};
