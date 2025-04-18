import { CloseIcon } from "@chakra-ui/icons";
import { VStack, Spinner, Text } from "@chakra-ui/react";
import useGlobal from "../logic/hooks/useGlobal";

export const Loading = ({
  message,
  onClose,
}: {
  message?: string;
  onClose?: () => void;
}) => {

  const [colorMode] = useGlobal(["colormode", "selected"]);

  return (
    <VStack spacing="5" w="100%" h="100%" justify="start" align="center" p="4">
      <CloseIcon
        fontSize="10px"
        color={colorMode === "light" ? "gray.500" : "#A1A1AA"}
        cursor="pointer"
        onClick={onClose}
        alignSelf="flex-end"
      />
      <VStack spacing="5" h="100%" justify="center" align="center">
        <Spinner size="xl" />
        {message && (
          <Text fontSize="lg" textAlign="center">
            {message}
          </Text>
        )}
      </VStack>
    </VStack>
  )
};
