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
  hidden
}: IProps) => {
  return (
    <FormControl hidden={hidden} isInvalid={!!errors[name]}>
      <FormLabel fontSize="lg" fontWeight="bold">
        {label}
      </FormLabel>
      <Input
        defaultValue={value}
        placeholder={placeholder}
        {...register(name, rules)}
        disabled={disabled}
      />
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
