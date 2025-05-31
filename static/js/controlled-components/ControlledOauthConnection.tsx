import { useEffect, useState } from "react";
import { Loading } from "../components/Loading";
import { useClickCreateOauthConnectionUx } from "../logic/hooks/ux/useClickCreateOauthConnectionUx";
import { IntegrationCreatedSection } from "../sections/IntegrationCreatedSection";
import { ConnectionFailedSection } from "../sections/ConnectionFailedSection";
import { useGetConnectionDefinition } from "../logic/hooks/useGetConnectionDefinition";
import useGetConnectionOauthDefinition from "../logic/hooks/useGetConnectionOauthDefinition";
import { ConnectionFormSection } from "../sections/ConnectionFormSection";
import { useForm } from "react-hook-form";
import { useUpdateEmbedTokenUx } from "../logic/hooks/ux/useUpdateEmbedTokenUx";
import axios, { AxiosResponse } from "axios";
import { apiKeys } from "../logic/apis";

export const ControlledOauthConnection = ({
  integrationId,
  setIntegrationId,
  clientId,
  scopes,
  setClientId,
  showNameInput,
  selectedConnection,
  sessionId,
  linkTokenEndpoint,
  linkHeaders,
  whiteLabel,
  environment,
  connectionGuide,
}: {
  integrationId: string;
  setIntegrationId: (id: string | undefined) => void;
  clientId: string;
  scopes?: string;
  setClientId: (id: string | undefined) => void;
  showNameInput?: boolean;
  selectedConnection?: string;
  sessionId: string;
  linkTokenEndpoint: string;
  linkHeaders?: Record<string, unknown>;
  whiteLabel?: boolean;
  environment?: "test" | "live";
  connectionGuide?: string;
}) => {
  const { definition, isLoading: isLoadingDefinition } =
    useGetConnectionDefinition({
      definitionId: integrationId,
    });

  const { connectionOauthDefinition, isLoading: isLoadingOauthDefinition } = useGetConnectionOauthDefinition(
    definition?.platform as string
  );

  const { trigger: updateEmbedToken } = useUpdateEmbedTokenUx();
  const [id, setSessionId] = useState<string>(sessionId);

  const handleClickBack = async () => {
    await updateEmbedToken({ sessionId: id });
    setIntegrationId(undefined);
    setClientId(undefined);
  };

  const handleClose = async () => {
    setIntegrationId(undefined);
    setClientId(undefined);
    await updateEmbedToken({ sessionId: id });
    window?.parent?.postMessage(
      {
        messageType: "EXIT_EVENT_LINK",
      },
      "*"
    );
  };

  const { trigger } = useClickCreateOauthConnectionUx();

  const [success, setSuccess] = useState<boolean>();
  const [errorMessage, setErrorMessage] = useState<string>();

  const [isLoading, setLoading] = useState<boolean>();
  const [isLoadingToken, setIsLoadingToken] = useState<boolean>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (formData: { [K: string]: unknown }) => {
    trigger({
      environment: environment as "test" | "live",
      clientId,
      type: connectionOauthDefinition?.connectionPlatform as string,
      iosRedirectUri: connectionOauthDefinition?.frontend
        ?.iosRedirectUri as string,
      platformRedirectUri: connectionOauthDefinition?.frontend
        ?.platformRedirectUri as string,
      sandboxPlatformRedirectUri: connectionOauthDefinition?.frontend?.sandboxPlatformRedirectUri as string,
      scopes: !scopes ? (connectionOauthDefinition?.frontend?.scopes || "") : scopes === "ios::no-scopes" ? "" : scopes,
      formData,
      sessionId: id,
      linkTokenEndpoint,
      linkHeaders,
      setSessionId,
      setLoading,
      setIsLoadingToken
    });
  };

  useEffect(() => {
    let timeoutId: any;
    const checkResponse = async () => {
      try {
        const result: AxiosResponse = await axios.post(
          apiKeys["get.embed.token"],
          { sessionId: id },
          {
            headers: {
              'x-pica-secret': linkHeaders?.['X-Pica-Secret'] as string
            }
          }
        );
        const responseData = result?.data?.[0]?.response;

        if (responseData?.isConnected) {
          setSuccess(true);
          setLoading(false);
          await updateEmbedToken({ sessionId: id });
          window.parent.postMessage(
            {
              messageType: "LINK_SUCCESS",
              message: responseData?.connection
            },
            "*"
          );
        } else if (responseData?.message) {
          setErrorMessage(responseData?.message);
          setLoading(false);
          await updateEmbedToken({ sessionId: id });
          window.parent.postMessage(
            {
              messageType: "LINK_ERROR",
              message: responseData?.message,
            },
            "*"
          );
        } else if (result?.data?.length === 0) {
          setErrorMessage("The session has expired. Please try again.");
          setLoading(false);
        } else {
          timeoutId = setTimeout(checkResponse, 5000);
        }
      } catch (error) {
        console.error("Error fetching embed token:", error);
        setErrorMessage("Failed to fetch embed token");
        setLoading(false);
      }
    };

    if (isLoading) {
      checkResponse();
    }

    return () => {
      clearTimeout(timeoutId); // Clear the timeout when the component unmounts
    };
  }, [isLoading]);

  const handleClick = () => {
    setErrorMessage(undefined);
  };

  return (
    <>
      {(isLoadingDefinition || isLoadingOauthDefinition) && <Loading onClose={handleClose} />}
      {success && <IntegrationCreatedSection onClose={handleClose} />}
      {errorMessage && (
        <ConnectionFailedSection
          errorMessage={errorMessage}
          onClose={handleClose}
          onClick={handleClick}
          onBack={handleClickBack}
          isConnectionSelected={!!selectedConnection}
        />
      )}
      {definition && connectionOauthDefinition && !success && !errorMessage && (
        <ConnectionFormSection
          onSubmit={onSubmit}
          definition={definition}
          onBack={handleClickBack}
          onClose={handleClose}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          error={errorMessage}
          showNameInput={showNameInput}
          isLoading={isLoading || isLoadingToken}
          isConnectionSelected={!!selectedConnection}
          helperLink={connectionGuide === "" ? undefined : (connectionGuide || definition?.frontend?.spec?.helperLink)}
          whiteLabel={whiteLabel}
        />
      )}
    </>
  );
};
