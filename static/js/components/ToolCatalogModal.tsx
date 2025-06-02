import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Box,
  Image,
  Grid,
  GridItem,
  Heading,
  Link,
  useColorMode,
} from '@chakra-ui/react';
import { Tool, ToolAction, APIResponse, KnowledgeAPIResponse, ToolCatalogModalProps } from '../types/toolCatalog';
import { ConnectionPlatform } from '../types/link';
import useGlobal from '../logic/hooks/useGlobal';

export const ToolCatalogModal: React.FC<ToolCatalogModalProps> = ({
  isOpen,
  onClose,
  onToolConnect,
  connectedPlatforms,
  linkTokenEndpoint,
  linkHeaders
}) => {
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedToolActions, setSelectedToolActions] = useState<ToolAction[]>([]);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetched, setFetched] = useState(false);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [assistantLookupComplete, setAssistantLookupComplete] = useState(false);

  const [colorMode] = useGlobal(['colormode', 'selected']);

  // API URLs
  const API_URL = 'https://backend.inhotel.io/tool/nondefault';
  const KNOWLEDGE_API_URL = 'https://platform-backend.inhotel.io/v1/knowledge';

  // Extract assistant_id from linkHeaders on mount
  useEffect(() => {
    const extractAssistantId = async () => {
      try {
        if (!linkHeaders?.['X-Pica-Secret']) {
          console.log('No X-Pica-Secret found in linkHeaders');
          setAssistantLookupComplete(true);
          return;
        }

        const secret = linkHeaders['X-Pica-Secret'] as string;
        console.log(`Processing secret: ${secret.substring(0, 20)}...`);

        // Call our assistant lookup API that queries MongoDB
        const response = await fetch('/api/assistant/lookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            secret: secret,
            options: {
              retryAlternative: true,
              includeMetadata: false,
              skipToolsFetch: true
            }
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.assistant_id) {
            setAssistantId(result.assistant_id);
            console.log(`Assistant ID found: ${result.assistant_id}`);
          } else {
            console.log('No assistant_id found in response:', result);
          }
        } else {
          console.warn('Failed to lookup assistant:', response.statusText);
        }
      } catch (error) {
        console.error('Error extracting assistant_id:', error);
      } finally {
        setAssistantLookupComplete(true);
      }
    };

    if (isOpen && linkHeaders) {
      setAssistantLookupComplete(false);
      extractAssistantId();
    }
  }, [isOpen, linkHeaders]);

  // Fetch tools from API
  const fetchTools = async (): Promise<Tool[]> => {
    try {
      // Build URL with inbox_id parameter if we have assistant_id
      let url = API_URL;
      if (assistantId) {
        url += `?inbox_id=${encodeURIComponent(assistantId)}`;
        console.log(`Fetching tools with assistant_id: ${assistantId}`);
      }

      const res = await fetch(url, { cache: 'no-store' });
      const json: APIResponse<any[]> = await res.json();
      
      if (json.status_code === 0 && Array.isArray(json.data)) {
        return json.data.map((t: any) => ({
          id: t.id.toString(),
          logo: t.logo_url || '',
          name: t.name,
          title: t.title || t.name,
          provider: t.provider,
          shortDesc: t.description,
          longDesc: `<p>${t.description}</p>`,
          categories: [t.category, ...(t.tags || [])],
          learnMore: '#',
          actions: t.actions || []
        }));
      }
      throw new Error('Unexpected response');
    } catch (err) {
      console.warn('API fetch failed; using fallback.', err);
      return [{
        id: '1',
        name: 'sample-tool',
        title: 'Sample Tool',
        shortDesc: 'Sample fallback tool description.',
        provider: 'Sample',
        longDesc: '<p>Sample fallback tool description.</p>',
        categories: ['Misc'],
        logo: '',
        learnMore: '#'
      }];
    }
  };

  // Fetch actions for specific tool
  const fetchToolActions = async (toolName: string): Promise<ToolAction[]> => {
    try {
      const url = `${KNOWLEDGE_API_URL}?limit=255&connectionPlatform=${encodeURIComponent(toolName)}`;
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'X-Pica-Secret': 'sk_test_1_3pejYG_SdSxV9xkt5_GA8WoMsSnfBHvY1qpGhlX-6DKd9kyZO3ee9hWfjGWpt5dY0AzxvM51q6_45_Q6bJTWCTuax7yq4X96nhvB0uTwhhLlsxyJm02JqasmdeDVeHt08GxGPoiBc7I9u00-1EKOejw62kNO0M1EaEFqwaGXw1Y8IfFH'
        }
      });
      const json: KnowledgeAPIResponse = await res.json();
      
      if (json.type === 'read' && Array.isArray(json.rows)) {
        return json.rows;
      }
      throw new Error('Unexpected response format');
    } catch (err) {
      console.warn('Actions fetch failed:', err);
      return [];
    }
  };

  // Handle tool selection
  const handleToolSelect = async (tool: Tool) => {
    setSelectedTool(tool);
    setActionsLoading(true);
    setSelectedToolActions([]);

    try {
      const actions = await fetchToolActions(tool.name);
      setSelectedToolActions(actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
      setSelectedToolActions([]);
    } finally {
      setActionsLoading(false);
    }
  };

  // Handle tool connection
  const handleToolConnect = (tool: Tool) => {
    const platform = connectedPlatforms.find(
      (p) => p.title === tool.name || p.title === tool.title || p.name === tool.name
    );

    if (!platform || !platform.connectionDefinitionId) {
      console.warn(`No matching platform found for tool: ${tool.name}`);
      return;
    }

    onToolConnect(
      platform.connectionDefinitionId,
      platform?.secret?.clientId,
      platform?.scopes,
      platform?.environment || 'test',
      platform?.connectionGuide
    );
  };

  // Check if a tool can be connected
  const isToolConnectable = (tool: Tool) => {
    const platform = connectedPlatforms.find(
      (p) => p.title === tool.name || p.title === tool.title || p.name === tool.name
    );
    return platform && platform.connectionDefinitionId;
  };

  // Filter tools based on search
  const filterTools = (query: string) => {
    if (!query.trim()) {
      setFilteredTools(allTools);
      return;
    }

    const filtered = allTools.filter(tool =>
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.title.toLowerCase().includes(query.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
      tool.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredTools(filtered);
  };

  // Load tools only after assistant lookup is complete
  useEffect(() => {
    const loadTools = async () => {
      if (!fetched && assistantLookupComplete) {
        setFetched(true);
        try {
          const tools = await fetchTools();
          setAllTools(tools);
          setFilteredTools(tools);
        } catch (error) {
          console.error('Error loading tools:', error);
        }
      }
    };

    loadTools();
  }, [fetched, assistantLookupComplete]);

  // Reset fetched state when assistantId changes
  useEffect(() => {
    if (assistantLookupComplete) {
      setFetched(false);
    }
  }, [assistantId, assistantLookupComplete]);

  // Handle search
  useEffect(() => {
    filterTools(searchQuery);
  }, [searchQuery, allTools]);

  // Render actions list
  const renderActionsList = () => {
    if (actionsLoading) {
      return (
        <Text fontSize="1rem" color={colorMode === 'light' ? '#a8a29e' : '#6b7280'} fontStyle="italic" m="0" lineHeight="1.2">
          Loading actions...
        </Text>
      );
    }

    if (selectedToolActions.length === 0) {
      return (
        <Text fontSize="1rem" color={colorMode === 'light' ? '#a8a29e' : '#6b7280'} fontStyle="italic" m="0" lineHeight="1.2">
          No actions available
        </Text>
      );
    }

    return (
      <Box>
        {selectedToolActions.map((action, index) => (
          <Box
            key={index}
            fontSize="1rem"
            color={colorMode === 'light' ? '#262626' : '#d1d5db'}
            lineHeight="1.2"
            dangerouslySetInnerHTML={{ __html: action.title }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false}>
        <ModalOverlay bg="rgba(0,0,0,0.4)" />
        <ModalContent
          maxW="95vw"
          maxH="90vh"
          bg={colorMode === 'light' ? '#f8f6f3' : '#1a1a1a'}
          border="2px solid"
          borderColor={colorMode === 'light' ? '#10b981' : '#10b981'}
          borderRadius="1.25rem"
          p="1.5rem"
        >
          <ModalCloseButton
            fontSize="3rem"
            w="2rem"
            h="2rem"
            color={colorMode === 'light' ? '#10b981' : '#10b981'}
            top="12px"
            right="12px"
            _hover={{ bg: '#ecfdf5', borderRadius: '50%' }}
          />

          <ModalBody p="0" display="flex" flexDirection="column" overflow="hidden" h="100%">
            <VStack spacing="4" align="stretch" h="100%" minH="0">
              {/* Header */}
              <VStack spacing="2" align="start" flexShrink={0}>
                <Heading as="h4" fontSize="1.75rem" m="0">
                  Connect a Tool
                </Heading>
                <Text color={colorMode === 'light' ? '#171717' : '#a3a3a3'} m="0">
                  Select systems and tools you wish to make available for the AI assistants in your organization.
                </Text>
              </VStack>

              {/* Search */}
              <Box display="flex" justifyContent="center" flexShrink={0}>
                <Input
                  placeholder="Search by name, description, or category tags…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  maxW="500px"
                  w="100%"
                  p="0.75rem 1.25rem"
                  fontSize="1rem"
                  border="1px solid"
                  borderColor={colorMode === 'light' ? '#e7e5e4' : '#374151'}
                  borderRadius="1.5rem"
                  _placeholder={{ color: colorMode === 'light' ? '#a8a29e' : '#6b7280' }}
                  _focus={{ 
                    outline: 'none', 
                    border: '1px solid', 
                    borderColor: '#10b981',
                    boxShadow: 'none'
                  }}
                />
              </Box>

              {/* Main Content - Fixed Layout */}
              <HStack spacing="1rem" flex="1" minH="0" align="stretch">
                {/* Tools Grid - Fixed Width */}
                <Box 
                  w="50%" 
                  minW="50%" 
                  maxW="50%" 
                  overflow="hidden"
                  flexShrink={0}
                >
                  <VStack 
                    spacing="0.5rem" 
                    align="stretch" 
                    overflowY="auto" 
                    pr="0.5rem"
                    h="100%"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#d1d5db',
                        borderRadius: '3px',
                      },
                    }}
                  >
                    {filteredTools.map((tool) => (
                      <Box
                        key={tool.id}
                        bg={selectedTool?.id === tool.id ? '#ffffff' : (colorMode === 'light' ? '#faf9f7' : '#2a2a2a')}
                        color={colorMode === 'light' ? '#1c1917' : '#f5f5f4'}
                        border="1px solid"
                        borderColor={selectedTool?.id === tool.id ? '#10b981' : (colorMode === 'light' ? '#f5f5f4' : '#374151')}
                        borderRadius="0.25rem"
                        cursor="pointer"
                        p="0.75rem"
                        minH="88px"
                        maxH="140px"
                        overflow="hidden"
                        transform="scale(1.00)"
                        transition="transform 0.2s ease, box-shadow 0.2s, border 0.2s, background 0.2s"
                        _hover={{
                          bg: selectedTool?.id === tool.id ? '#ffffff' : (colorMode === 'light' ? '#f8f6f3' : '#374151'),
                          transform: 'scale(1.00)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          borderColor: '#10b981',
                        }}
                        onClick={() => handleToolSelect(tool)}
                      >
                        <HStack spacing="0.75rem" mb="0">
                          <Image
                            src={tool.logo}
                            w="64px"
                            h="64px"
                            objectFit="contain"
                            alt={tool.title}
                          />
                          <VStack align="start" flex="1">
                            <Text fontSize="1rem" fontWeight="medium" color={colorMode === 'light' ? '#0a0a0a' : '#f5f5f4'} m="4px 0">
                              {tool.title}
                            </Text>
                            <Text 
                              fontSize="0.9rem" 
                              color={colorMode === 'light' ? '#262626' : '#a3a3a3'} 
                              mt="0" 
                              lineHeight="1.1"
                              overflow="hidden"
                              textOverflow="ellipsis"
                              display="-webkit-box"
                              css={{
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {tool.shortDesc}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {/* Details Panel - Fixed Width */}
                <Box
                  w="50%"
                  minW="50%"
                  maxW="50%"
                  flexShrink={0}
                >
                  <Box
                    bg={selectedTool ? '#ffffff' : (colorMode === 'light' ? '#faf9f7' : '#2a2a2a')}
                    border="1px solid"
                    borderColor={colorMode === 'light' ? '#f5f5f4' : '#374151'}
                    borderRadius="0.25rem"
                    p="16px"
                    overflowY="auto"
                    display="flex"
                    flexDirection="column"
                    h="100%"
                  >
                    {!selectedTool ? (
                      <Image
                        src="https://cdn.prod.website-files.com/657ae60d92ed823479730a3f/67f93be4b1e4cf832343dce6_inhotel-pineapple-sand-060.svg"
                        alt="Pineapple background image"
                        m="auto"
                        maxH="80%"
                        maxW="80%"
                        w="auto"
                        h="auto"
                      />
                    ) : (
                      <VStack spacing="1rem" align="stretch" h="100%">
                        {/* Header with logo and Add button */}
                        <HStack justify="space-between" align="flex-start">
                          <Image
                            src={selectedTool.logo}
                            w="64px"
                            h="64px"
                            objectFit="contain"
                            alt={selectedTool.title}
                          />
                          <Button
                            bg={isToolConnectable(selectedTool) ? (colorMode === 'light' ? '#10b981' : '#10b981') : '#d1d5db'}
                            color={isToolConnectable(selectedTool) ? "white" : '#9ca3af'}
                            size="sm"
                            borderRadius="md"
                            _hover={isToolConnectable(selectedTool) ? { bg: '#059669' } : {}}
                            onClick={() => handleToolConnect(selectedTool)}
                            isDisabled={!isToolConnectable(selectedTool)}
                            cursor={isToolConnectable(selectedTool) ? 'pointer' : 'not-allowed'}
                            title={isToolConnectable(selectedTool) ? 'Connect this tool' : 'This tool is not available for connection'}
                          >
                            {isToolConnectable(selectedTool) ? 'Connect' : 'Not Available'}
                          </Button>
                        </HStack>

                        {/* Tool name */}
                        <Heading as="h5" fontSize="1.375rem" textAlign="center" m="0.25rem 0">
                          {selectedTool.title}
                        </Heading>

                        {/* Learn more */}
                        <Box display="flex" justifyContent="center">
                          <Link
                            href={selectedTool.learnMore}
                            fontSize="0.9rem"
                            color={colorMode === 'light' ? '#a8a29e' : '#6b7280'}
                            textDecoration="none"
                            target="_blank"
                            _hover={{ textDecoration: 'underline' }}
                          >
                            Learn more
                          </Link>
                        </Box>

                        {/* Details grid */}
                        <Grid templateColumns="max-content 1fr" rowGap="0.5rem" columnGap="1rem" mt="1rem">
                          <Text fontSize="0.9rem" color={colorMode === 'light' ? '#57534e' : '#6b7280'} fontWeight="300">
                            Provider
                          </Text>
                          <Text fontSize="1rem" color={colorMode === 'light' ? '#262626' : '#d1d5db'} m="0">
                            {selectedTool.provider}
                          </Text>

                          <Text fontSize="0.9rem" color={colorMode === 'light' ? '#57534e' : '#6b7280'} fontWeight="300">
                            Description
                          </Text>
                          <Box
                            fontSize="1rem"
                            color={colorMode === 'light' ? '#262626' : '#d1d5db'}
                            lineHeight="1.2"
                            dangerouslySetInnerHTML={{ __html: selectedTool.longDesc }}
                          />

                          <Text fontSize="0.9rem" color={colorMode === 'light' ? '#57534e' : '#6b7280'} fontWeight="300">
                            Actions ({selectedToolActions.length})
                          </Text>
                          <Box>
                            {renderActionsList()}
                          </Box>
                        </Grid>
                      </VStack>
                    )}
                  </Box>
                </Box>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}; 