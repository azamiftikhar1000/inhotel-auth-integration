import { useEffect, useState } from "react";
import { ControlledConnectionsList } from "../controlled-components/ControlledConnectionsList";
import { ControlledConnectionForm } from "../controlled-components/ControlledConnectionForm";
import { ControlledOauthConnection } from "../controlled-components/ControlledOauthConnection";

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
  const [integrationId, setIntegrationId] = useState<string | undefined>();
  const [clientId, setClientId] = useState<string | undefined>();
  const [scopes, setScopes] = useState<string>();
  const [connectionGuide, setConnectionGuide] = useState<string>();
  const [sessionId, setSessionId] = useState<string>("");
  const [environment, setEnvironment] = useState<"test" | "live">("test");

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
    }
  }, []);

  return (
    <>
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
      {!integrationId && messageData && !clientId && (
        <ControlledConnectionsList
          linkTokenEndpoint={messageData.linkTokenEndpoint}
          linkHeaders={messageData.linkHeaders}
          setIntegrationId={setIntegrationId}
          setClientId={setClientId}
          setScopes={setScopes}
          setConnectionGuide={setConnectionGuide}
          title={messageData.title}
          selectedConnection={messageData.selectedConnection}
          setSessionId={setSessionId}
          sessionId={sessionId}
          setWhiteLabel={setWhiteLabel}
          setEnvironment={setEnvironment}
        />
      )}
    </>
  );
};
