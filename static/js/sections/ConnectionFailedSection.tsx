import { CloseIcon, WarningIcon } from "@chakra-ui/icons";
import { VStack, Text, Button } from "@chakra-ui/react";
import useGlobal from "../logic/hooks/useGlobal";


interface IProps {
  onClose: () => void;
    errorMessage: string;
    onClick?: () => void;
    onBack?: () => void;
    isConnectionSelected?: boolean;
}

export const ConnectionFailedSection = ({ onClose, errorMessage, onClick, onBack, isConnectionSelected }: IProps) => {

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
          <WarningIcon h="50px" w="50px" color="red.500" />
          <Text textAlign='center'>
            {errorMessage}
          </Text>
          {onClick && <Button variant='base' _hover={{
              bg: colorMode === "light" ? "black" : "gray.100",
              color: colorMode === "light" ? "white" : "black",
            }}
            bg={colorMode === "light" ? "black" : "gray.100"}
            color={colorMode === "light" ? "white" : "black"} w='100%' onClick={isConnectionSelected ? onClose : onBack}>
            {
              isConnectionSelected ? "Close window" : "Try again"
            }
          </Button>}
        </VStack>
      </VStack>
    </VStack>
  );
};
