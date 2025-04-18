import { useUpdateEmbedTokenUx } from "./useUpdateEmbedTokenUx";
import { useGetEmbedToken } from "../useGetEmbedToken";
import { EmbedTokenRecord } from "../../../types/tokens";
import { useCreateEventLinkToken } from "../useCreateEventLinkToken";
import Mustache from "mustache";

export const useClickCreateOauthConnectionUx = () => {
  const { trigger: updateEmbedToken } = useUpdateEmbedTokenUx();
  const { getEmbedToken } = useGetEmbedToken();
  const { createEventLinkToken } = useCreateEventLinkToken();

  const trigger = async ({
    type,
    clientId,
    iosRedirectUri,
    platformRedirectUri,
    sandboxPlatformRedirectUri,
    scopes,
    formData,
    sessionId,
    linkTokenEndpoint,
    linkHeaders,
    setSessionId,
    setLoading,
    setIsLoadingToken,
    environment
  }: {
    type: string;
    clientId: string;
    iosRedirectUri: string;
    platformRedirectUri: string;
    sandboxPlatformRedirectUri?: string;
    scopes: string;
    formData: { [K: string]: unknown };
    sessionId: string;
    linkTokenEndpoint: string;
    linkHeaders?: Record<string, unknown>;
    setSessionId: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setIsLoadingToken: (loading: boolean) => void;
    environment: "test" | "live";
  }) => {
    try {
      setIsLoadingToken(true);
      let token: EmbedTokenRecord[] = await getEmbedToken(sessionId);

      if (!token?.[0] || token?.[0]?.expiresAt < new Date().getTime()) {
        const newToken: EmbedTokenRecord = await createEventLinkToken({
          linkTokenEndpoint,
          linkHeaders,
        });

        token = [newToken];
        setSessionId(newToken?.sessionId);
      }
      setIsLoadingToken(false);
      setLoading(true);

      if (formData) {
        await updateEmbedToken({ sessionId: token?.[0]?.sessionId, formData });
      }

      if (platformRedirectUri.includes("{{")) {
        platformRedirectUri = Mustache.render(platformRedirectUri, formData);
      }

      if (sandboxPlatformRedirectUri?.includes("{{")) {
        sandboxPlatformRedirectUri = Mustache.render(
          sandboxPlatformRedirectUri,
          formData
        );
      }

      let redirectUri = platformRedirectUri;
      if (
        sandboxPlatformRedirectUri &&
        sandboxPlatformRedirectUri !== "" &&
        environment === "test"
      ) {
        redirectUri = sandboxPlatformRedirectUri;
      }

      window.open(
        `${redirectUri}&client_id=${clientId}&redirect_uri=${iosRedirectUri}&scope=${scopes}&state=${type}::${token?.[0]?.sessionId}`,
        "connect",
        "width=500,height=800"
      );
    } catch (error) {
      setIsLoadingToken(false);
      console.error(error);
    }
  };

  return {
    trigger,
  };
};
