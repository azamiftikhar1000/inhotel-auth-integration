import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Rules } from "../../types/integrations";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useState } from "react";
import useGlobal from "../../logic/hooks/useGlobal";

interface FormPasswordProps {
  label: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  rules: Rules;
  errors: FieldErrors<FieldValues>;
}

export const FormPassword = ({
  label,
  placeholder,
  name,
  register,
  rules,
  errors,
}: FormPasswordProps) => {
  const [show, setShow] = useState(false);

  const [colorMode] = useGlobal(['colormode', 'selected']);

  return (
    <FormControl isInvalid={!!errors[name]}>
      <FormLabel fontSize="lg" fontWeight="bold">{label}</FormLabel>
      <InputGroup>
        <Input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          {...register(name, rules)}
          bg="#ffffff"
          border="1px solid"
          borderColor="var(--sand-200, #e9d4b9)"
          _focus={{
            outline: "none",
            border: "1px solid",
            borderColor: "var(--green-300, #a1d3ba)",
            bg: "var(--sand--020, #fefdfb)",
            boxShadow: "none",
          }}
        />
        <InputRightElement  minW="max-content">
          <Button fontSize="sm" _hover={{
                  bg: colorMode === "light" ? "black" : "gray.100",
                  color: colorMode === "light" ? "white" : "black",
                }}
                bg={colorMode === "light" ? "black" : "gray.100"}
                color={colorMode === "light" ? "white" : "black"} borderRadius="md"  onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
