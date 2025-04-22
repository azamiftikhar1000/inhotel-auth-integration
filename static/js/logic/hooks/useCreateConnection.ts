import { useMutation } from "react-query";
import { CreateConnectionProps } from "../../types/link";
import { createConnection } from "../apis/integrations";

export const useCreateConnection = () => {
  const mutation = useMutation(
    ({
      linkToken,
      authFormData,
      connectionDefinitionId,
      type,
      linkHeaders,
    }: CreateConnectionProps) =>
      createConnection({
        linkToken,
        authFormData,
        connectionDefinitionId,
        type,
        linkHeaders
      })
  );

  return {
    createIntegration: mutation.mutateAsync,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
  };
};
