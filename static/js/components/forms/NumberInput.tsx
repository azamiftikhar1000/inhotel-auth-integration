import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";
import { Rules } from "../../types/integrations";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";

interface NumberInputProps {
  label: string;
  placeholder: string;
  name: string;
  register: UseFormRegister<FieldValues>;
  rules: Rules;
  errors: FieldErrors<FieldValues>;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
}

export const FormNumberInput = ({
  label,
  placeholder,
  name,
  register,
  rules,
  errors,
  min,
  max,
  step,
  value
}: NumberInputProps) => {
  return (
    <FormControl isInvalid={!!errors[name]}>
      <FormLabel fontSize="lg" fontWeight="bold">
        {label}
      </FormLabel>
      <NumberInput min={min} max={max} step={step} defaultValue={value}>
        <NumberInputField placeholder={placeholder ?? ''} {...register(name, rules)}/>
          {/* <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper> */}
      </NumberInput>
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
