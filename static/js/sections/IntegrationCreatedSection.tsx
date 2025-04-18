import { CheckCircleIcon, CloseIcon } from "@chakra-ui/icons";
import { VStack, Heading, Button } from "@chakra-ui/react";
import useGlobal from "../logic/hooks/useGlobal";

interface IProps {
  onClose: () => void;
}

export const IntegrationCreatedSection = ({ onClose }: IProps) => {
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

      <VStack w="100%" h="100%" spacing="5" align="center">
        <VStack spacing="5" justify="center" w="100%" h="100%">
          <CheckCircleIcon h="50px" w="50px" color="green.500" />
          <Heading as="h1" fontSize="xl">
            Connected successfully!
          </Heading>
          <Button
            onClick={onClose}
            variant="base"
            _hover={{
              bg: colorMode === "light" ? "black" : "gray.100",
              color: colorMode === "light" ? "white" : "black",
            }}
            bg={colorMode === "light" ? "black" : "gray.100"}
            color={colorMode === "light" ? "white" : "black"}
            w="100%"
          >
            Close
          </Button>
        </VStack>
      </VStack>
    </VStack>
  );
};
