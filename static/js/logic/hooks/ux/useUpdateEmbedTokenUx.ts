import { useUpdateEmbedToken } from "../useUpdateEmbedToken";

export const useUpdateEmbedTokenUx = () => {
  const { updateEmbedToken } = useUpdateEmbedToken();

  const trigger = async ({sessionId, formData}: {sessionId: string, formData?: { [K: string]: unknown }}) => {
    try {
      await updateEmbedToken({ sessionId, formData });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    trigger,
  };
};
