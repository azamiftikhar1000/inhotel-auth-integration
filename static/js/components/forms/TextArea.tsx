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
      <FormLabel fontSize="lg" fontWeight="bold">
        {label}
      </FormLabel>
      <Textarea placeholder={placeholder} {...register(name, rules)} />
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
