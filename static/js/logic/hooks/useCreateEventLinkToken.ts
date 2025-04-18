import { useMutation } from "react-query";
import { createEventLinkTokenApi } from "../apis/links";
import { EventLinkTokenProps } from "../../types/link";

export const useCreateEventLinkToken = () => {
    const mutation = useMutation(
        (payload: EventLinkTokenProps) => createEventLinkTokenApi(payload)
    );

    return {
        createEventLinkToken: mutation.mutateAsync,
        isLoading: mutation.isLoading,
    };

};