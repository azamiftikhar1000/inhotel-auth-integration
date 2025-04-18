import { ChevronLeftIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import {
  VStack,
  Image,
  HStack,
  Text,
  Heading,
  Button,
  Alert,
  AlertIcon,
  Box,
} from "@chakra-ui/react";
import {
  UseFormRegister,
  FieldValues,
  UseFormHandleSubmit,
  FieldErrors,
  Control,
} from "react-hook-form";
import { FormInput } from "../components/forms/Input";
import { FormSelect } from "../components/forms/Select";
import { FormNumberInput } from "../components/forms/NumberInput";
import { FormPassword } from "../components/forms/Password";
import { FormTextArea } from "../components/forms/TextArea";
import { ConnectionDefinition } from "../types/integrations";
import { VscQuestion } from "react-icons/vsc";
import useGlobal from "../logic/hooks/useGlobal";
import { FormSwitch } from "../components/forms/Switch";
import MarkdownRenderer from "../components/MarkdownRenderer";

interface IProps {
  definition: ConnectionDefinition;
  onClose: () => void;
  onSubmit: (data: { [K: string]: string }) => void;
  onBack?: () => void;
  register: UseFormRegister<FieldValues>;
  control?: Control<FieldValues, any>
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  errors: FieldErrors<FieldValues>;
  error?: string;
  showNameInput?: boolean;
  isLoading?: boolean;
  isConnectionSelected?: boolean;
  helperLink?: string;
  whiteLabel?: boolean;
}

export const ConnectionFormSection = ({
  definition,
  onClose,
  onBack,
  register,
  control,
  handleSubmit,
  onSubmit,
  errors,
  error,
  showNameInput,
  isLoading,
  isConnectionSelected,
  helperLink,
  whiteLabel,
}: IProps) => {
  const [colorMode] = useGlobal(["colormode", "selected"]);

  const formData = showNameInput
    ? [
        {
          name: "NAME",
          type: "input",
          label: "Name",
          placeholder: "My Connection",
          rules: {
            required: "This field is required",
          },
        },
        ...definition?.frontend?.connectionForm?.formData,
      ]
    : definition?.frontend?.connectionForm?.formData;

  return (
    <VStack
      align="center"
      justify="space-between"
      overflowY="auto"
      w="100%"
      h="100%"
      sx={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <VStack w="100%" padding="4">
        <HStack justify="space-between" w="100%" align="center">
          <HStack
            cursor="pointer"
            spacing="0px"
            onClick={onBack}
            color={colorMode === "light" ? "gray.500" : "#A1A1AA"}
            align="center"
          >
            {!isConnectionSelected && (
              <HStack spacing="0" hidden={isLoading}>
                <ChevronLeftIcon fontSize="lg" />
                <Text>Back</Text>
              </HStack>
            )}
          </HStack>
          <CloseIcon
            fontSize="10px"
            color={colorMode === "light" ? "gray.500" : "#A1A1AA"}
            cursor="pointer"
            onClick={onClose}
          />
        </HStack>
        <VStack
          w="100%"
          py="5"
          spacing="3"
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
          overflowY="auto"
        >
          <Image src={definition?.frontend?.spec?.image} />
          <Heading textAlign="center" as="h1" fontSize="xl">
            {definition?.frontend?.spec?.title}
          </Heading>
          <Text
            textAlign="center"
            color={colorMode === "light" ? "gray.500" : "gray.300"}
          >
            {definition?.frontend?.spec?.category}
          </Text>
          <form style={{ width: "100%" }} onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing="5">
              <VStack w="100%" spacing="0">
                {formData?.map((form: any) => {
                  return (
                    <VStack
                      pt={form.hidden ? "0" : "5"}
                      w="100%"
                      key={form.name}
                    >
                      {form?.type === "input" && (
                        <FormInput
                          name={form.name}
                          label={form.label}
                          placeholder={form.placeholder}
                          rules={form.rules}
                          register={register}
                          errors={errors}
                          disabled={form.disabled}
                          value={form.value}
                          hidden={form.hidden}
                        />
                      )}
                      {form?.type === "select" && (
                        <FormSelect
                          name={form.name}
                          label={form.label}
                          rules={form.rules}
                          register={register}
                          errors={errors}
                          options={form.options}
                          hidden={form.hidden}
                        />
                      )}
                      {form?.type === "number" && (
                        <FormNumberInput
                          name={form.name}
                          label={form.label}
                          placeholder={form.placeholder}
                          rules={form.rules}
                          register={register}
                          errors={errors}
                          max={form.max}
                          min={form.min}
                          step={form.step}
                          value={form.value}
                        />
                      )}
                      {form?.type === "switch" && (
                        <FormSwitch
                          name={form.name}
                          label={form.label}
                          rules={form.rules}
                          register={register}
                          errors={errors}
                          control={control}
                          hidden={form.hidden}
                        />
                      )}
                      {form?.type === "password" && (
                        <FormPassword
                          name={form.name}
                          label={form.label}
                          placeholder={form.placeholder}
                          rules={form.rules}
                          register={register}
                          errors={errors}
                        />
                      )}
                      {form?.type === "textarea" && (
                        <FormTextArea
                          name={form.name}
                          label={form.label}
                          placeholder={form.placeholder}
                          rules={form.rules}
                          register={register}
                          errors={errors}
                        />
                      )}
                    </VStack>
                  );
                })}
              </VStack>
              {definition?.frontend?.spec?.markdown && (
                <Box maxW="100%" width="full" border={"1px dashed"} borderColor={colorMode === "light" ? "gray.400" : "gray.600"} borderRadius="md" px={2}>
                  <MarkdownRenderer
                    markdown={definition.frontend.spec.markdown}
                  />
                </Box>
              )}
              {error && (
                <Alert borderRadius="5" status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <Button
                isLoading={isLoading}
                _hover={{
                  bg: colorMode === "light" ? "black" : "gray.100",
                  color: colorMode === "light" ? "white" : "black",
                }}
                bg={colorMode === "light" ? "black" : "gray.100"}
                color={colorMode === "light" ? "white" : "black"}
                loadingText="Connecting"
                type="submit"
                w="100%"
                variant="base"
              >
                {isLoading ? "Connecting" : "Connect"}
              </Button>
            </VStack>
          </form>
        </VStack>
      </VStack>
      {isLoading && (
        <HStack h="100%" align="end" padding="4" spacing="1" pb="10px">
          <Text>Having trouble connecting?</Text>
          <Text
            cursor="pointer"
            textDecoration="underline"
            fontWeight="bold"
            onClick={isConnectionSelected ? onClose : onBack}
          >
            Try again
          </Text>
        </HStack>
      )}
      {helperLink && (
        <Alert
          justifyContent="center"
          minH="40px"
          bg={colorMode === "light" ? "#FAFAFA" : "#1d1d1d"}
          borderBottomRadius={whiteLabel ? "12px" : "0px"}
          borderBottom={whiteLabel ? "none" : "1px solid"}
          borderBottomColor={
            whiteLabel ? "none" : colorMode === "light" ? "gray.300" : "#2a2a2a"
          }
        >
          <VscQuestion
            color={colorMode === "light" ? "black" : "white"}
            size="18px"
          />
          <HStack spacing="1">
            <Text color={colorMode === "light" ? "black" : "white"} pl="1">
              Need help? View our
            </Text>
            <Text
              color={colorMode === "light" ? "black" : "white"}
              fontWeight="bold"
              textDecoration="underline"
            >
              <a href={helperLink} target="_blank" rel="noreferrer">
                Connection Guide
              </a>
            </Text>
            <ExternalLinkIcon
              color={colorMode === "light" ? "black" : "white"}
            />
          </HStack>
        </Alert>
      )}
    </VStack>
  );
};
