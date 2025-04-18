import { useEffect, useState } from "react";
import { useCreateEventLinkToken } from "../logic/hooks/useCreateEventLinkToken";
import { Loading } from "../components/Loading";
import { ConnectionPlatform } from "../types/link";
import { ConnectionsListSection } from "../sections/ConnectionsListSection";
import axios from "axios";
import { useTracking } from "../logic/hooks/tracking/useTracking";
import { trackingConstants } from "../constants/tracking";
import _ from "lodash";
import { ConnectionFailedSection } from "../sections/ConnectionFailedSection";
import { EmbedTokenRecord } from "../types/tokens";
import { useUpdateEmbedTokenUx } from "../logic/hooks/ux/useUpdateEmbedTokenUx";

export const ControlledConnectionsList = ({
  title,
  linkTokenEndpoint,
  linkHeaders,
  setIntegrationId,
  setEnvironment,
  setClientId,
  setScopes,
  setConnectionGuide,
  selectedConnection,
  setSessionId,
  sessionId,
  setWhiteLabel,
}: {
  title?: string;
  linkTokenEndpoint: string;
  linkHeaders?: Record<string, unknown>;
  setIntegrationId: (id: string) => void;
  setEnvironment?: (value: "test" | "live") => void;
  setClientId: (id: string) => void;
  setScopes: (scopes: string) => void;
  setConnectionGuide?: (url: string) => void;
  selectedConnection?: string;
  setSessionId: (id: string) => void;
  sessionId: string;
  setWhiteLabel?: (value: boolean) => void;
}) => {
  const { createEventLinkToken, isLoading } = useCreateEventLinkToken();

  const [error, setError] = useState();

  const [connectedPlatforms, setConnectedPlatforms] = useState<
    ConnectionPlatform[]
  >([]);

  const { track } = useTracking();

  const { trigger } = useUpdateEmbedTokenUx();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token: EmbedTokenRecord = await createEventLinkToken({
          linkTokenEndpoint,
          linkHeaders,
        });

        setConnectedPlatforms(token?.linkSettings?.connectedPlatforms);
        setWhiteLabel?.(
          token?.features?.find(
            (feature) => feature.key === "authkit::white-label"
          )?.value === "enabled"
        );

        if (selectedConnection) {
          const platform = token?.linkSettings?.connectedPlatforms?.find(
            (platform) =>
              platform?.title === selectedConnection ||
              platform?.connectionDefinitionId === selectedConnection
          );

          setIntegrationId(
            platform?.connectionDefinitionId || selectedConnection
          );

          setClientId(platform?.secret?.clientId as string);
          setScopes(platform?.scopes as string);
          setConnectionGuide?.(platform?.connectionGuide as string);
        }
        setSessionId(token?.sessionId);
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

    fetchData();
  }, []);

  const handleClose = async () => {
    await trigger({ sessionId });
    window?.parent?.postMessage(
      {
        messageType: "EXIT_EVENT_LINK",
      },
      "*"
    );
  };

  const handleClick = ({
    id,
    clientId,
    scopes,
    environment,
    connectionGuide,
  }: {
    id: string;
    clientId?: string;
    scopes?: string;
    environment?: "test" | "live";
    connectionGuide?: string;
  }) => {
    setIntegrationId(id);
    setEnvironment?.(environment as "test" | "live");
    setClientId(clientId as string);
    setScopes(scopes as string);
    setConnectionGuide?.(connectionGuide as string);
  };

  const activePlatforms = _.orderBy(
    connectedPlatforms?.filter((platform) => platform?.active),
    ["title"],
    ["asc"]
  );

  return (
    <>
      {isLoading && (
        <Loading message="Loading integrations" onClose={handleClose} />
      )}
      {!isLoading && !error && (
        <ConnectionsListSection
          connectedPlatforms={activePlatforms}
          title={title}
          onClose={handleClose}
          onClick={handleClick}
        />
      )}
      {error && (
        <ConnectionFailedSection errorMessage={error} onClose={handleClose} />
      )}
    </>
  );
};
