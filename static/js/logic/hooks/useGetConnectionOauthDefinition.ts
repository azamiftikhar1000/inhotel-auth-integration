import { useQuery } from 'react-query';
import { ConnectionOauthDefinitions } from '../../types/oauth';
import { remoteKeys } from '../apis';
import { getConnectionOauthDefinitionApi } from '../apis/oauth';

export default function useGetConnectionOauthDefinition(type: string) {
  const connectionOauthDefinitions = useQuery(
    [remoteKeys.getConnectionOauthDefinition, type],
    () => getConnectionOauthDefinitionApi(),
    {
      enabled: !!type,
      staleTime: 5 * 60 * 1000,
    }
  );

  //TODO: Filter the connectionOauthDefinitions by type
  const data = connectionOauthDefinitions?.data?.rows?.filter((definition) => definition?.connectionPlatform === type)?.[0];

  return {
    connectionOauthDefinition: data,
    isLoading: connectionOauthDefinitions.isLoading,
  };
}
