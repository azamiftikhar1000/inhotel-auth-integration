import { useMutation } from "react-query";
import { getEmbedTokenApi } from "../apis/tokens";

export const useGetEmbedToken = () => {
  const mutation = useMutation((sessionId: string) =>
    getEmbedTokenApi(sessionId)
  );

  return {
    getEmbedToken: mutation.mutateAsync,
    isLoading: mutation.isLoading,
  };
};
