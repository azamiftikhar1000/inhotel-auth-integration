import { ChevronLeftIcon, CloseIcon, ExternalLinkIcon, InfoIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
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
        name: "name",
        type: "input",
        label: "Name",
        placeholder: "My Connection",
        rules: {
          required: "This field is required",
        },
      },
      ...(definition?.frontend?.connectionForm?.formData || []),
    ]
    : (definition?.frontend?.connectionForm?.formData || []);

  return (
    <VStack
      align="center"
      justify="space-between"
      overflowY="auto"
      w="100%"
      h="100%"
      bg="var(--sand-060, #f9f3ec)"
      border="2px solid"
      borderColor="var(--green-300, #a1d3ba)"
      borderRadius="12px"
      sx={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <VStack
        as={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        w="100%"
        padding="4"
        spacing="3"
      >
        <HStack
          justify="end"
          w="calc(100% + 2rem)"
          margin="-1rem -1rem 0 -1rem"
          align="center"
          pt="12px"
          pr="12px"
          pb={2}
          position="sticky"
          top="0"
          zIndex="10"
          bg="var(--sand-060, #f9f3ec)"
        >
          <HStack
            cursor="pointer"
            spacing="1"
            onClick={onBack}
            color="var(--green-300, #a1d3ba)"
            align="center"
            w="2rem"
            h="2rem"
            justify="center"
            display="flex"
            transition="all 0.2s"
            borderRadius="50%"
            _hover={{
              color: "var(--green-400, #82c4a3)",
              bg: "var(--sand-100, #f4e9dc)",
            }}
          >
            {!isConnectionSelected && (
              <Box hidden={isLoading}>
                <CloseIcon fontSize="1.25rem" />
              </Box>
            )}
          </HStack>
        </HStack>
        <VStack
          w="100%"
          py="4"
          spacing="2"
          sx={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
          overflowY="auto"
        >
          <Image
            src={definition?.frontend?.spec?.image}
            maxW="60%"
            h="auto"
            objectFit="contain"
          />
          <Heading
            textAlign="center"
            as="h1"
            fontSize="xl"
            fontFamily="Open Sans, sans-serif"
            fontWeight="300"
            color="var(--neutral--900, #0f0f0f)"
            lineHeight="1.222em"
          >
            {definition?.frontend?.spec?.title}
          </Heading>
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
                      {form?.type === "static_text" && (
                        <Box w="100%">
                          {form.label && (
                            <Text fontSize="lg" fontWeight="bold" mb="1">
                              {form.label}
                            </Text>
                          )}
                          <Text
                            fontSize="sm"
                            color="var(--neutral--800, #292929)"
                            lineHeight="1.5"
                          >
                            {form.value || form.text || form.placeholder || ""}
                          </Text>
                        </Box>
                      )}
                      {(form?.type === "input" ||
                        form?.type === "text" ||
                        form?.type === "email" ||
                        form?.type === "url") && (
                          <FormInput
                            type={form.type === "input" ? "text" : form.type}
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

              {error && (
                <Alert borderRadius="5" status="error">
                  <AlertIcon />
                  {error}
                </Alert>
              )}
              <Button
                isLoading={isLoading}
                className="button white-green slim"
                px="20px"
                py=".5rem"
                borderRadius="9999px"
                bg="var(--neutral--000, #ffffff)"
                border="1px solid"
                borderColor="var(--neutral--200, #bfbfbf)"
                color="var(--neutral--900, #0f0f0f)"
                fontStyle="normal"
                _hover={{
                  bg: "var(--green-300, #a1d3ba)",
                  transform: "translateY(-3px)",
                }}
                loadingText="Connecting"
                type="submit"
                w="100%"
              >
                {isLoading ? "Connecting" : "Connect"}
              </Button>
              {definition?.frontend?.spec?.markdown && (
                <Box maxW="100%" width="full">
                  <MarkdownRenderer
                    markdown={definition.frontend.spec.markdown}
                  />
                </Box>
              )}
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
