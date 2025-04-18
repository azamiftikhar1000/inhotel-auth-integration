import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Switch,
} from "@chakra-ui/react";
import {
  UseFormRegister,
  FieldValues,
  FieldErrors,
  Controller,
  Control,
} from "react-hook-form";
import { Rules } from "../../types/integrations";

interface SwitchProps {
  label: string;
  name: string;
  rules: Rules;
  errors: FieldErrors<FieldValues>;
  register: UseFormRegister<FieldValues>;
  control?: Control<FieldValues, any>;
  hidden?: boolean;
}

export const FormSwitch = ({
  label,
  name,
  register,
  control,
  rules,
  errors,
  hidden,
}: SwitchProps) => {
  return (
    <FormControl hidden={hidden} isInvalid={!!errors[name]}>
      <FormLabel fontSize="lg" fontWeight="bold">
        {label}
      </FormLabel>
      <HStack align="start" justify="start" gap={1}>
        <Controller
          rules={rules}
          control={control}
          name={name}
          defaultValue="false"
          render={({ field: { onChange, value, ref } }) => (
            <Switch
              isChecked={value === "true" ? true : false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(e.target.checked ? "true" : "false");
              }}
              ref={ref}
            />
          )}
        />
      </HStack>
      <FormErrorMessage>{`${errors[name]?.message}`}</FormErrorMessage>
    </FormControl>
  );
};
