import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { Rules } from "../../types/integrations";

interface IProps {
  label: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  rules: Rules;
  errors: FieldErrors<FieldValues>;
  disabled?: boolean;
  value?: string;
  hidden?: boolean;
  type?: string;
}

export const FormInput = ({
  label,
  placeholder,
  name,
  register,
  rules,
  errors,
  disabled,
  value,
  hidden,
  type = "text",
}: IProps) => {
  return (
    <FormControl hidden={hidden} isInvalid={!!errors[name]}>
      <FormLabel fontSize="lg" fontWeight="bold">
        {label}
      </FormLabel>
      <Input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        {...register(name, rules)}
        disabled={disabled}
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
