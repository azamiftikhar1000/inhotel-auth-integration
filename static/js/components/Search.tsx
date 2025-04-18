import { SearchIcon } from "@chakra-ui/icons";
import { InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { ChangeEvent } from "react";
import useGlobal from "../logic/hooks/useGlobal";

interface SearchComponentProps {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const SearchComponent = ({ onChange }: SearchComponentProps) => {

  const [colorMode] = useGlobal(["colormode", "selected"]);

  return (
    <InputGroup size="lg">
      <InputLeftElement
        pointerEvents="none"
        children={<SearchIcon fontSize="lg"  />}
      />
      <Input
        onChange={onChange}
        placeholder="Search"
        variant="filled"
        size="lg"
        bg={colorMode === "light" ? "gray.100" : "#0f0f0f"}
        _hover={{
          bg: colorMode === "light" ? "gray.100" : "#0f0f0f"
        }}

      />
    </InputGroup>
  );
};
