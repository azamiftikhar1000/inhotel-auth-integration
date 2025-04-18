import { useMutation } from "react-query";
import { updateEmbedTokenApi } from "../apis/tokens";

export const useUpdateEmbedToken = () => {
  const mutation = useMutation((payload: { sessionId: string, formData?: { [K: string]: unknown } }) =>
    updateEmbedTokenApi(payload)
  );

  return {
    updateEmbedToken: mutation.mutateAsync,
    isLoading: mutation.isLoading,
  };
};
