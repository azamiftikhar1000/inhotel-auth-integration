import { apiKeys, apiRequest } from ".";

export const getEmbedTokenApi = (sessionId: string, messageData?: { linkHeaders?: { 'X-Pica-Secret'?: string } }) => apiRequest({
    method: "POST",
    url: apiKeys["get.embed.token"],
    payload: { sessionId },
    messageData
})

export const updateEmbedTokenApi = (payload: {
    sessionId: string
    formData?: { [K: string]: unknown }
}) => apiRequest({
    method: "POST",
    url: apiKeys["update.embed.token"],
    payload
});