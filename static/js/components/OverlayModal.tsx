import { Button, HStack, VStack, Text, Image } from "@chakra-ui/react";
import { ReactElement } from "react";
import useGlobal from "../logic/hooks/useGlobal";

export const OverlayModal = ({ children, whiteLabel }: { children: ReactElement, whiteLabel?: boolean }) => {
  const [colorMode] = useGlobal(["colormode", "selected"]);
  return (
    <VStack
      w="100vw"
      h="100vh"
      bg="rgba(0, 0, 0, 0.4)"
      backdropFilter="blur(8px)"
      display="flex"
      align="center"
      justify="center"
      spacing="0"
    >
      <VStack
        maxW="375px"
        maxH="720px"
        w="100%"
        h="100%"
        spacing="0"
        position="relative"
      >
        <VStack
          borderRadius="12px"
          bg={colorMode === "light" ? "white" : "black"}

          h="calc(100% - 40px)"
          w="100%"
          zIndex="100"
          position="relative"
        >
          {children}
        </VStack>
       {!whiteLabel && <Button
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          zIndex="99"
          h="60px"
          borderTopRadius="0"
          borderBottomRadius="12px"
          w="full"
          pt="32px"
          pb="12px"
          variant="base"
          cursor="default"
          bg={colorMode === "light" ? "#FAFAFA" : "#1d1d1d"}
          _hover={{
            bg: colorMode === "light" ? "#FAFAFA" : "#1d1d1d"
          }}
        >
          <HStack w="100%" justify="center" align="center">
            <Text fontSize="sm" color={colorMode === "light" ? "gray.400" : "#A1A1AA"} >Secured by</Text>
            <a href="https://inhotel.io" target="_blank" rel="noopener noreferrer">
              <Image src={colorMode === "light" ? "https://cdn.prod.website-files.com/657ae60d92ed823479730a3f/67fb02a683fe906731362325_inhotel-logo-green-400.svg" : "https://cdn.prod.website-files.com/657ae60d92ed823479730a3f/67fb02a683fe906731362325_inhotel-logo-green-400.svg"} h="15px" alt="AuthKit logo" />
            </a>
          </HStack>
        </Button>}
      </VStack>
    </VStack>
  );
};
