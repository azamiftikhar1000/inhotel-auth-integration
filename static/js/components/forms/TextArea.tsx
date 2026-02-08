import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
} from "@chakra-ui/react";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";
import { Rules } from "../../types/integrations";

interface TextAreaProps {
  label: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  rules: Rules;
  errors: FieldErrors<FieldValues>;
}

export const FormTextArea = ({
  label,
  placeholder,
  name,
  register,
  rules,
  errors,
}: TextAreaProps) => {
  return (
    <FormControl isInvalid={!!errors[name]}>
      <FormLabel
        fontSize="14.4px"
        fontWeight="300"
        fontFamily="'Open Sans', sans-serif"
        color="var(--neutral--900, #0f0f0f)"
        mb="1"
        pl="1"
      >
        {label}
      </FormLabel>
      <Textarea
        placeholder={placeholder}
        {...register(name, rules)}
        borderRadius="1.25rem"
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
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
