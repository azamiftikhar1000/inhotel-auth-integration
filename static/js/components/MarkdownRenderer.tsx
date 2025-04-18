import React from "react";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { Box, Heading, Text, Code } from "@chakra-ui/react";
import { Components } from "react-markdown";

interface MarkdownRendererProps {
  markdown: string;
}

interface ThemeComponents {
  children?: React.ReactNode;
}

const newTheme: Partial<Components> = {
  h3: ({ children }: ThemeComponents) => (
    <Heading as="h3" fontSize="14.625px" mt={3} mb={4}>
      {children}
    </Heading>
  ),

  p: ({ children }: ThemeComponents) => (
    <Text mt={4} mb={4}>
      {children}
    </Text>
  ),

  code: ({ children }: ThemeComponents) => (
    <Code px={3} py={2} borderRadius="md" fontSize="0.9em" fontFamily="mono">
      {children}
    </Code>
  ),

  // Handle line breaks
  br: () => <Box height={4} />,
};

export default function MarkdownRenderer({
  markdown = "",
}: MarkdownRendererProps) {
  // Replace \n\n with actual line breaks for better spacing
  const formattedMarkdown = markdown.replace(/\\n\\n/g, "\n\n");

  return (
    <ReactMarkdown components={ChakraUIRenderer(newTheme)} skipHtml>
      {formattedMarkdown}
    </ReactMarkdown>
  );
}
