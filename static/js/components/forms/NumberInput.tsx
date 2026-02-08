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
      <FormLabel
        fontSize="14.4px"
        fontWeight="300"
        fontFamily="'Open Sans', sans-serif"
        color="rgb(179, 123, 56)"
        mb="1"
      >
        {label}
      </FormLabel>
      <NumberInput min={min} max={max} step={step} defaultValue={value}>
        <NumberInputField
          placeholder={placeholder ?? ''}
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
        {/* <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper> */}
      </NumberInput>
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
