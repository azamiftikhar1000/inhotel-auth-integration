import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Rules } from "../../types/integrations";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
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
        <InputRightElement width="4.5rem" height="100%" alignItems="center" justifyContent="center">
          <IconButton
            aria-label={show ? "Hide password" : "Show password"}
            variant="ghost"
            size="sm"
            fontSize="xl"
            icon={show ? <ViewOffIcon /> : <ViewIcon />}
            onClick={() => setShow(!show)}
            _hover={{
              bg: colorMode === "light" ? "sand.100" : "whiteAlpha.200",
              color: colorMode === "light" ? "black" : "white",
            }}
            transition="all 0.2s"
          />
        </InputRightElement>
      </InputGroup>
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
