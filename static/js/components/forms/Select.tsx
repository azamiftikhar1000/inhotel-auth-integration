import { FormControl, FormErrorMessage, FormLabel, Select } from "@chakra-ui/react";
import { UseFormRegister, FieldValues, FieldErrors } from "react-hook-form";
import { Rules } from "../../types/integrations";

interface SelectProps {
  label: string;
  name: string;
  rules: Rules;
  errors:FieldErrors<FieldValues>;
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
      <FormLabel fontSize="lg" fontWeight="bold">
        {label}
      </FormLabel>
      <Select {...register(name, rules)}>
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
