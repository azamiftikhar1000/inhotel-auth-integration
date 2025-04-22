import { useQuery } from "react-query";
import { remoteKeys } from "../apis";
import { getConnectionDefinition } from "../apis/integrations";
import { ConnectionDefinitions } from "../../types/integrations";

export const useGetConnectionDefinition = ({
  definitionId,
}: {
  definitionId: string;
}) => {
  const { data, isLoading } = useQuery(
    [remoteKeys.getConnectionDefinition, definitionId],
    () => getConnectionDefinition(definitionId),
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60 * 24,
      retry: false,
    }
  );

  return { definition: data?.rows?.[0], isLoading };
};
