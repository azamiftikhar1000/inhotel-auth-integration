import { useEffect, useState } from "react";
import { ControlledConnectionForm } from "../controlled-components/ControlledConnectionForm";
import { ControlledOauthConnection } from "../controlled-components/ControlledOauthConnection";
import { ToolCatalogModal } from "../components/ToolCatalogModal";
import { useCreateEventLinkToken } from "../logic/hooks/useCreateEventLinkToken";
import { ConnectionPlatform } from "../types/link";
import { EmbedTokenRecord } from "../types/tokens";
import axios from "axios";
import { useTracking } from "../logic/hooks/tracking/useTracking";
import { trackingConstants } from "../constants/tracking";
import { useUpdateEmbedTokenUx } from "../logic/hooks/ux/useUpdateEmbedTokenUx";

export const MainSection = ({
  setWhiteLabel,
  whiteLabel,
}: {
  setWhiteLabel?: (value: boolean) => void;
  whiteLabel?: boolean;
}) => {
  interface MessageData {
    connectionType: string;
    integrationTypes?: string[];
    linkTokenEndpoint: string;
    group: string;
    linkHeaders?: Record<string, unknown>;
    title?: string;
    selectedConnection?: string;
    showNameInput?: boolean;
  }

  const [messageData, setMessageData] = useState<MessageData>();
  const [integrationId, setIntegrationId] = useState<string>();
  const [clientId, setClientId] = useState<string>();
  const [scopes, setScopes] = useState<string>("");
  const [connectionGuide, setConnectionGuide] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [environment, setEnvironment] = useState<"test" | "live">("test");
  const [connectedPlatforms, setConnectedPlatforms] = useState<ConnectionPlatform[]>([]);
  const [userClosed, setUserClosed] = useState(false);
  const [error, setError] = useState();

  const { createEventLinkToken, isLoading } = useCreateEventLinkToken();
  const { track } = useTracking();
  const { trigger } = useUpdateEmbedTokenUx();

  // Control iframe visibility - only show during connection flows
  useEffect(() => {
    const isInConnectionFlow = (clientId && integrationId) || (integrationId && !clientId);
    
    if (userClosed || (messageData && !isInConnectionFlow)) {
      // Hide iframe when modal is closed OR when just showing the catalog modal
      document.documentElement.style.width = '0';
      document.documentElement.style.height = '0';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.width = '0';
      document.body.style.height = '0';
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.overflow = 'hidden';
    } else if (isInConnectionFlow) {
      // Show iframe only during connection flows
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.overflow = '';
    }
  }, [userClosed, messageData, clientId, integrationId]);

  useEffect(() => {
    const queryParameters = new URLSearchParams(
      window?.location?.href.split("?")[1]
    );

    const base64Decoded = queryParameters.get("data") || "";

    if (base64Decoded) {
      const jsonDecoded = atob(base64Decoded);
      const decodedObject = JSON.parse(jsonDecoded);
      setMessageData(decodedObject);
      setIntegrationId(undefined);
      
      // Fetch connected platforms and open modal
      fetchConnectedPlatforms(decodedObject);
    }
  }, []);

  const fetchConnectedPlatforms = async (data: MessageData) => {
    try {
      const token: EmbedTokenRecord = await createEventLinkToken({
        linkTokenEndpoint: data.linkTokenEndpoint,
        linkHeaders: data.linkHeaders,
      });

      setConnectedPlatforms(token?.linkSettings?.connectedPlatforms || []);
      
      if (token?.features && Array.isArray(token.features)) {
        const whiteLabel = token.features.find(
          (feature) => feature.key === "authkit::white-label"
        );
        setWhiteLabel?.(whiteLabel?.value === "enabled");
      }

      setSessionId(token?.sessionId || "");
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const description =
          error?.response?.data?.message?.message ||
          error?.response?.data?.message ||
          error?.response?.data ||
          "Some error occurred";
        track(trackingConstants.TRACK_ERROR, {
          error: description,
        });
        setError(description);
      }
    }
  };

  const handleModalClose = async () => {
    setUserClosed(true);
    await trigger({ sessionId });
    window?.parent?.postMessage(
      {
        messageType: "EXIT_EVENT_LINK",
      },
      "*"
    );
  };

  const handleToolConnect = (
    id: string,
    clientId?: string,
    scopes?: string,
    environment?: "test" | "live",
    connectionGuide?: string
  ) => {
    setIntegrationId(id);
    setEnvironment?.(environment || "test");
    setClientId(clientId || "");
    setScopes(scopes || "");
    setConnectionGuide?.(connectionGuide || "");
  };

  return (
    <>
      {/* Tool Catalog Modal - Show when we have messageData but not in connection flows and user hasn't closed it */}
      {messageData && !integrationId && !clientId && !userClosed && (
        <ToolCatalogModal
          isOpen={true}
          onClose={handleModalClose}
          onToolConnect={handleToolConnect}
          connectedPlatforms={connectedPlatforms}
          linkTokenEndpoint={messageData.linkTokenEndpoint}
          linkHeaders={messageData.linkHeaders}
        />
      )}

      {/* Existing Connection Flow (OAuth) */}
      {clientId && integrationId && messageData && (
        <ControlledOauthConnection
          integrationId={integrationId}
          setIntegrationId={setIntegrationId}
          clientId={clientId}
          scopes={scopes}
          setClientId={setClientId}
          showNameInput={messageData?.showNameInput}
          selectedConnection={messageData?.selectedConnection}
          sessionId={sessionId}
          linkTokenEndpoint={messageData.linkTokenEndpoint}
          linkHeaders={messageData?.linkHeaders}
          whiteLabel={whiteLabel}
          environment={environment}
          connectionGuide={connectionGuide}
        />
      )}

      {/* Existing Connection Flow (Form) */}
      {integrationId && messageData && !clientId && (
        <ControlledConnectionForm
          definitionId={integrationId}
          setIntegrationId={setIntegrationId}
          linkHeaders={messageData.linkHeaders}
          selectedConnection={messageData.selectedConnection}
          showNameInput={messageData.showNameInput ?? false}
          sessionId={sessionId}
          linkTokenEndpoint={messageData.linkTokenEndpoint}
          whiteLabel={whiteLabel}
          connectionGuide={connectionGuide}
        />
      )}
    </>
  );
};
