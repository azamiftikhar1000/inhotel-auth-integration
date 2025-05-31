import { useForm } from "react-hook-form";
import { IntegrationCreatedSection } from "../sections/IntegrationCreatedSection";
import { Loading } from "../components/Loading";
import { useClickCreateConnectionUx } from "../logic/hooks/ux/useClickCreateConnectionUx";
import { ConnectionFormSection } from "../sections/ConnectionFormSection";
import { useGetConnectionDefinition } from "../logic/hooks/useGetConnectionDefinition";
import { IntegrationIncompleteSection } from "../sections/IntegrationIncompleteSection";
import { useUpdateEmbedTokenUx } from "../logic/hooks/ux/useUpdateEmbedTokenUx";
import { useState } from "react";
import { EmptyState } from "../components/EmptyState";

export const ControlledConnectionForm = ({
  definitionId,
  setIntegrationId,
  linkHeaders,
  selectedConnection,
  showNameInput,
  sessionId,
  linkTokenEndpoint,
  whiteLabel,
  connectionGuide,
}: {
  definitionId: string;
  setIntegrationId: (id: string | undefined) => void;
  linkHeaders?: Record<string, unknown>;
  selectedConnection?: string;
  showNameInput?: boolean;
  sessionId: string;
  linkTokenEndpoint: string;
  whiteLabel?: boolean;
  connectionGuide?: string;
}) => {
  const { definition, isLoading } = useGetConnectionDefinition({
    definitionId,
  });

  const { trigger: updateEmbedToken } = useUpdateEmbedTokenUx();

  const [id, setSessionId] = useState<string>(sessionId);

  const {
    trigger,
    isLoading: isProcessing,
    response,
    errorMessage,
  } = useClickCreateConnectionUx();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm();

  const handleClickBack = async () => {
    await updateEmbedToken({sessionId: id});
    setIntegrationId(undefined);
  };

  const handleClose = async () => {
    setIntegrationId(undefined);
    await updateEmbedToken({sessionId: id});
    window?.parent?.postMessage(
      {
        messageType: "EXIT_EVENT_LINK",
      },
      "*"
    );
  };

  const onSubmit = (data: { [K: string]: unknown }) => {
    if (definition) {

      trigger({
        name: `${data.name}`,
        integrationId: definition._id || "",
        credentials: {},
        label: `${data.name}`,
        authFormData: data,
        connectionDefinitionId: definition._id,
        type: definition?.platform,
        linkHeaders,
        sessionId: id,
        linkTokenEndpoint,
        setSessionId,
      });
    }
  };

  return (
    <>
      {isLoading && <Loading  onClose={handleClose} />}
      {isProcessing && <Loading message="Setting up your integration..." onClose={handleClose} />}
      {response && <IntegrationCreatedSection onClose={handleClose} />}
      {definition?.settings?.oauth && <IntegrationIncompleteSection onClose={handleClose} />}
      {!isLoading && !isProcessing && !response && definition && !definition?.settings?.oauth && (
        <ConnectionFormSection
          onSubmit={onSubmit}
          definition={definition}
          onBack={selectedConnection ? undefined : handleClickBack}
          onClose={handleClose}
          register={register}
          control={control}
          handleSubmit={handleSubmit}
          errors={errors}
          error={errorMessage}
          showNameInput={showNameInput}
          isConnectionSelected={!!selectedConnection}
          helperLink={connectionGuide === "" ? undefined : (connectionGuide || definition?.frontend?.spec?.helperLink)}
          whiteLabel={whiteLabel}
        />
      )}
      {!isLoading && !isProcessing && !response && !definition && (
        <EmptyState 
          message="This platform does not exist" 
          onClose={handleClose}
        />
      )}
    </>
  );
};
