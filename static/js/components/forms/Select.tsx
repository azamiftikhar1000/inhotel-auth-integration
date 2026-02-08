import { FormControl, FormErrorMessage, FormLabel, Select } from "@chakra-ui/react";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";
import { Rules } from "../../types/integrations";

interface SelectProps {
  label: string;
  name: string;
  rules: Rules;
  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<FieldValues>;
  hidden?: boolean;
  options: {
    name: string;
    value: string;
  }[];
}

export const FormSelect = ({
  label,
  options,
  name,
  register,
  rules,
  errors,
  hidden
}: SelectProps) => {

  return (
    <FormControl hidden={hidden} isInvalid={!!errors[name]}>
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
      <Select
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
      >
        {options.map(({ name, value }) => (
          <option value={value} key={name}>
            {name}
          </option>
        ))}
      </Select>
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
