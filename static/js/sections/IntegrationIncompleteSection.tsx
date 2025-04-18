import { CloseIcon } from "@chakra-ui/icons";
import { VStack, Text } from "@chakra-ui/react";
import useGlobal from "../logic/hooks/useGlobal";

interface IProps {
  onClose: () => void;
}

export const IntegrationIncompleteSection = ({ onClose }: IProps) => {

  const [colorMode] = useGlobal(["colormode", "selected"]);

  return (
    <VStack spacing="5" w="100%" h="100%" padding="4">
      <CloseIcon
        fontSize="10px"
        color={colorMode === "light" ? "gray.500" : "#A1A1AA"}
        cursor="pointer"
        onClick={onClose}
        alignSelf="end"
      />

      <VStack w="100%" h="100%" spacing="5" justify="center" align="center">
        <Text textAlign="center" w="100%">
          Finish setting up this connection in the configuration page.
        </Text>
      </VStack>
    </VStack>
  );
};
