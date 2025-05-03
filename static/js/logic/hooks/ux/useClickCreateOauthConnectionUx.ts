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
    console.log('[OAuth Connection] Starting with params:', {
      type,
      clientId,
      iosRedirectUri,
      platformRedirectUri,
      sandboxPlatformRedirectUri,
      scopes,
      sessionId,
      linkTokenEndpoint,
      environment,
      formDataKeys: Object.keys(formData || {})
    });
    
    try {
      setIsLoadingToken(true);
      let token: EmbedTokenRecord[] = await getEmbedToken({ 
        sessionId,
        messageData: { linkHeaders }
      });
      console.log('[OAuth Connection] Retrieved embed token:', token);

      if (!token?.[0] || (token[0].expiresAt && Number(token[0].expiresAt) < new Date().getTime())) {
        console.log('[OAuth Connection] Token expired or not found, creating new token');
        const newToken: EmbedTokenRecord = await createEventLinkToken({
          linkTokenEndpoint,
          linkHeaders,
        });
        console.log('[OAuth Connection] Created new token:', newToken);

        token = [newToken];
        if (newToken && 'sessionId' in newToken) {
          setSessionId(newToken.sessionId as string);
        } else {
          console.error('[OAuth Connection] Missing sessionId in newToken:', newToken);
        }
      }
      setIsLoadingToken(false);
      setLoading(true);

      if (formData) {
        console.log('[OAuth Connection] Updating embed token with form data');
        await updateEmbedToken({ 
          sessionId: token[0] && 'sessionId' in token[0] ? token[0].sessionId as string : sessionId, 
          formData 
        });
      }

      let effectivePlatformRedirectUri = platformRedirectUri;
      if (platformRedirectUri.includes("{{")) {
        console.log('[OAuth Connection] Rendering platformRedirectUri template');
        effectivePlatformRedirectUri = Mustache.render(platformRedirectUri, formData);
        console.log('[OAuth Connection] Rendered platformRedirectUri:', effectivePlatformRedirectUri);
      }

      let effectiveSandboxRedirectUri = sandboxPlatformRedirectUri;
      if (sandboxPlatformRedirectUri?.includes("{{")) {
        console.log('[OAuth Connection] Rendering sandboxPlatformRedirectUri template');
        effectiveSandboxRedirectUri = Mustache.render(
          sandboxPlatformRedirectUri,
          formData
        );
        console.log('[OAuth Connection] Rendered sandboxPlatformRedirectUri:', effectiveSandboxRedirectUri);
      }

      let redirectUri = effectivePlatformRedirectUri;
      if (
        effectiveSandboxRedirectUri &&
        effectiveSandboxRedirectUri !== "" &&
        environment === "test"
      ) {
        console.log('[OAuth Connection] Using sandbox redirect URI for test environment');
        redirectUri = effectiveSandboxRedirectUri;
      }
      console.log('[OAuth Connection] Redirect URI:', redirectUri);

      const finalSessionId = token[0] && 'sessionId' in token[0] ? token[0].sessionId as string : sessionId;
      console.log("Client ID: ", clientId)
      // const openUrl = `${redirectUri}&scope=${scopes}&client_id=${clientId}&redirect_uri=${iosRedirectUri}&state=${type}::${finalSessionId}`;
      const openUrl = `${redirectUri}` +
                      `&scope=${encodeURIComponent(scopes)}` +
                      `&client_id=${encodeURIComponent(clientId)}` +
                      `&redirect_uri=${encodeURIComponent(iosRedirectUri)}` +
                      `&state=${encodeURIComponent(`${type}::${finalSessionId}`)}`;

      console.info('[OAuth Connection] Opening OAuth window with URL:', openUrl);
      window.open(
        openUrl,
        "connect",
        "width=500,height=800"
      );
      // const popup = window.open(openUrl);
      // window.location.href = openUrl;
    } catch (error) {
      setIsLoadingToken(false);
      console.error('[OAuth Connection] Error in OAuth connection process:', error);
      if (error instanceof Error) {
        console.error('[OAuth Connection] Error details:', {
          message: error.message,
          stack: error.stack
        });
      }
    }
  };

  return {
    trigger,
  };
};
