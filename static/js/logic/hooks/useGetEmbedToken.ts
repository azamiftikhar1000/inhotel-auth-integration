import { useMutation } from "react-query";
import { getEmbedTokenApi } from "../apis/tokens";

export const useGetEmbedToken = () => {
  const mutation = useMutation(({ sessionId, messageData }: { sessionId: string, messageData?: { linkHeaders?: { 'X-Pica-Secret'?: string } } }) =>
    getEmbedTokenApi(sessionId, messageData)
  );

  return {
    getEmbedToken: mutation.mutateAsync,
    isLoading: mutation.isLoading,
  };
};
