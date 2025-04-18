import { Image, VStack, Heading } from "@chakra-ui/react";
import useGlobal from "../logic/hooks/useGlobal";

interface IProps {
  image: string;
  heading: string;
  onClick: (_id: string) => void;
  _id: string;
}

export const CardWithImageAndHeading = ({
  image,
  heading,
  onClick,
  _id,
}: IProps) => {
  const [colorMode] = useGlobal(["colormode", "selected"]);

  return (
    <VStack
      borderRadius="6px"
      cursor="pointer"
      p="5"
      justify="center"
      align="center"
      boxShadow="rgba(0, 0, 0, 0.20) 0px 1px 8px -2px"
      onClick={() => onClick(_id)}
      m="1"
      bg={colorMode === "light" ? "white" : "#0f0f0f"}
      _hover={{
        bg: colorMode === "light" ? "rgba(0, 0, 0, 0.02)" : "#151515",
      }}
    >
      <Image src={image} w="40px" h="40px" className={`card-with-image-and-heading-${heading}`} />
      <Heading as="h6" fontWeight="medium" fontSize="sm" textAlign="center">
        {heading}
      </Heading>
    </VStack>
  );
};
