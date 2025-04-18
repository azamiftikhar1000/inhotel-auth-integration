import { CloseIcon } from "@chakra-ui/icons";
import { Heading, SimpleGrid, VStack } from "@chakra-ui/react";
import { CardWithImageAndHeading } from "../components/CardWithImageAndHeading";
import { SearchComponent } from "../components/Search";
import { ChangeEvent, useEffect, useState } from "react";
import { ConnectionPlatform } from "../types/link";
import useGlobal from "../logic/hooks/useGlobal";

interface IProps {
  onClose: () => void;
  onClick: ({ id, clientId, scopes, environment, connectionGuide }: { id: string; clientId?: string; scopes?: string; environment?: "test" | "live"; connectionGuide?: string }) => void;
  title?: string;
  connectedPlatforms: ConnectionPlatform[];
}

export const ConnectionsListSection = ({
  onClose,
  onClick,
  title = "Integrations",
  connectedPlatforms,
}: IProps) => {
  const [filteredPlatforms, setFilteredPlatforms] =
    useState<ConnectionPlatform[]>(connectedPlatforms);

  useEffect(() => {
    setFilteredPlatforms(connectedPlatforms);
  }, [connectedPlatforms]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilteredPlatforms(
      connectedPlatforms?.filter((platform) =>
        platform?.title?.toLowerCase().includes(e.target.value.toLowerCase())
      )
    );
  };

  const [colorMode] = useGlobal(["colormode", "selected"]);

  return (
    <VStack spacing="5" h="100%" w="100%" align="start" overflowY="hidden" padding="4">
      <CloseIcon
        fontSize="10px"
        color={colorMode === "light" ? "gray.500" : "#A1A1AA"}
        cursor="pointer"
        onClick={onClose}
        alignSelf="flex-end"
      />

      <Heading as="h1" fontSize="3xl">
        {title}
      </Heading>
      <SearchComponent onChange={handleChange} />
      <SimpleGrid
        overflowY="auto"
        sx={{
          "&::-webkit-scrollbar": {
            display: "none",
          },
        }}
        w="100%"
        columns={3}
        spacing={3}
      >
        {filteredPlatforms?.map((platform) => (
          <CardWithImageAndHeading
            key={platform?.connectionDefinitionId}
            _id={platform?.connectionDefinitionId}
            onClick={(id: string) =>
              onClick({ id, clientId: platform?.secret?.clientId, scopes: platform?.scopes, environment: platform?.environment || "test", connectionGuide: platform?.connectionGuide })
            }
            image={platform?.image}
            heading={platform?.title}
          />
        ))}
      </SimpleGrid>
    </VStack>
  );
};
