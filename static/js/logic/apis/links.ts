import { apiRequest } from ".";
import { EventLinkTokenProps, LinkTokenProps } from "../../types/link";

export const createLinkToken = ({
  label,
  group,
  connectionType,
  type,
  linkTokenEndpoint = "",
  linkHeaders,
}: LinkTokenProps) =>
  apiRequest({
    url: linkTokenEndpoint,
    method: "POST",
    headers: linkHeaders,
    payload: {
      label,
      group,
      type,
      connectionType,
    },
  });

export const createEventLinkTokenApi = ({
  linkTokenEndpoint,
  linkHeaders,
}: EventLinkTokenProps) =>
  apiRequest({
    url: linkTokenEndpoint,
    method: "POST",
    headers: linkHeaders,
    payload: {},
  });
