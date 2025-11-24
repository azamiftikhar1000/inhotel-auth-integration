import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Box,
  Spinner,
  Image,
  Grid,
  GridItem,
  Heading,
  useColorMode,
} from '@chakra-ui/react';
import { Tool, ToolAction, APIResponse, KnowledgeAPIResponse, ActionAPIResponse, ToolCatalogModalProps } from '../types/toolCatalog';
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
  const [toolsLoading, setToolsLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string>('');

  const [colorMode] = useGlobal(['colormode', 'selected']);

  // API URLs
  const API_URL = 'https://backend.inhotel.io/tool/nondefault';
  const KNOWLEDGE_API_URL = 'https://platform-backend.inhotel.io/v1/knowledge';
  const ACTION_API_URL = 'https://backend.inhotel.io/pica/connection-model-defs';

  // Extract assistant_id from linkHeaders on mount
  useEffect(() => {
    const extractAssistantId = async () => {
      try {
        if (!linkHeaders?.['X-Pica-Secret']) {
          console.log('No X-Pica-Secret found in linkHeaders');
          setAssistantLookupComplete(true);
          setLookupError("Couldn't identify the assistant. Missing secret.");
          setToolsLoading(false);
          return;
        }

        const secret = linkHeaders['X-Pica-Secret'] as string;
        console.log(`Processing secret: ${secret.substring(0, 20)}...`);

        // Retry a few times with short timeouts for robustness
        const attempts = 3;
        let success = false;
        for (let i = 0; i < attempts; i++) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500);
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
              signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.assistant_id) {
                setAssistantId(result.assistant_id);
                console.log(`Assistant ID found: ${result.assistant_id}`);
                success = true;
                break;
              }
            } else {
              console.warn('Failed to lookup assistant:', response.statusText);
            }
          } catch (err) {
            if ((err as any)?.name === 'AbortError') {
              console.warn(`Assistant lookup try ${i + 1} timed out`);
            } else {
              console.warn(`Assistant lookup try ${i + 1} failed`, err);
            }
          }
          // Small delay before retry
          await new Promise((r) => setTimeout(r, 300));
        }
        if (!success) {
          setLookupError("Couldn't identify the assistant. Please refresh and try again.");
          setToolsLoading(false);
        } else {
          setLookupError('');
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

      // Timeout to avoid hanging on slow networks
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { cache: 'no-store', signal: controller.signal });
      clearTimeout(timeoutId);
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
      const url = `${ACTION_API_URL}?limit=255&connectionPlatform=${encodeURIComponent(toolName)}&include=title`;
      const res = await fetch(url, {
        cache: 'no-store',
        // headers: {
        //   'X-Pica-Secret': 'sk_test_1_3pejYG_SdSxV9xkt5_GA8WoMsSnfBHvY1qpGhlX-6DKd9kyZO3ee9hWfjGWpt5dY0AzxvM51q6_45_Q6bJTWCTuax7yq4X96nhvB0uTwhhLlsxyJm02JqasmdeDVeHt08GxGPoiBc7I9u00-1EKOejw62kNO0M1EaEFqwaGXw1Y8IfFH'
        // }
      });
      const json: ActionAPIResponse = await res.json();
      
      if (json.status_code === 0 && Array.isArray(json?.data?.args?.rows)) {
        return json.data.args.rows;
      }
      throw new Error('Unexpected response format');
    } catch (err) {
      console.error('Actions fetch failed:', err);
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

  const evaluateToolConnectability = (tool: Tool, log: boolean = false) => {
    const normalize = (s?: string) => (s || '').toLowerCase();
    const tName = normalize(tool.name);
    const tTitle = normalize(tool.title);
    let matchedPlatform: ConnectionPlatform | undefined;

    for (const p of connectedPlatforms) {
      const candidates = [p.platform, p.title, p.name, p.type].map(normalize);
      const matched = candidates.includes(tName) || candidates.includes(tTitle);
      if (log) {
        console.debug('[ToolCatalog] match-check', {
          tool: { id: tool.id, name: tName, title: tTitle },
          platform: { id: p.id, name: normalize(p.name), title: normalize(p.title), platform: normalize(p.platform), type: normalize(p.type) },
          candidates,
          matched,
        });
      }
      if (matched) {
        matchedPlatform = p;
        break;
      }
    }

    if (!matchedPlatform) {
      if (log) {
        console.info('[ToolCatalog] Tool not connectable: no matching platform', {
          tool: { id: tool.id, name: tName, title: tTitle },
          platformsConsidered: connectedPlatforms.length,
        });
      }
      return { connectable: false, platform: undefined as ConnectionPlatform | undefined };
    }

    if (!matchedPlatform.connectionDefinitionId) {
      if (log) {
        console.info('[ToolCatalog] Tool not connectable: missing connectionDefinitionId', {
          tool: { id: tool.id, name: tName, title: tTitle },
          platform: {
            id: matchedPlatform.id,
            name: matchedPlatform.name,
            title: matchedPlatform.title,
            platform: matchedPlatform.platform,
          },
        });
      }
    }

    if (log) {
      const hasClientId = Boolean(matchedPlatform.secret?.clientId);
      console.debug('[ToolCatalog] Tool connectability evaluation', {
        tool: { id: tool.id, name: tName, title: tTitle },
        platform: {
          id: matchedPlatform.id,
          name: matchedPlatform.name,
          title: matchedPlatform.title,
          platform: matchedPlatform.platform,
          type: matchedPlatform.type,
          connectionDefinitionId: matchedPlatform.connectionDefinitionId,
          hasClientId,
          environment: matchedPlatform.environment,
        },
      });
    }

    return { connectable: Boolean(matchedPlatform.connectionDefinitionId), platform: matchedPlatform };
  };

  // Handle tool connection
  const handleToolConnect = (tool: Tool) => {
    const { connectable, platform } = evaluateToolConnectability(tool, true);
    if (!connectable || !platform?.connectionDefinitionId) {
      console.warn('[ToolCatalog] Cannot connect tool - not connectable', {
        tool: { id: tool.id, name: tool.name, title: tool.title },
      });
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
    const { connectable } = evaluateToolConnectability(tool, false);
    return connectable;
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

  // While waiting for assistantId, show skeleton but don't fetch unrefined tools
  useEffect(() => {
    if (isOpen && !fetched) {
      setToolsLoading(true);
    }
  }, [isOpen, fetched]);

  // Fetch tools only after we have assistantId (refined results)
  useEffect(() => {
    const loadTools = async () => {
      if (!fetched && assistantId) {
        setFetched(true);
        setToolsLoading(true);
        try {
          const tools = await fetchTools();
          setAllTools(tools);
          setFilteredTools(tools);
        } catch (error) {
          console.error('Error loading tools:', error);
        } finally {
          setToolsLoading(false);
        }
      }
    };
    loadTools();
  }, [fetched, assistantId]);

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

  useEffect(() => {
    if (selectedTool) {
      // Log once whenever the selection changes for better diagnostics
      evaluateToolConnectability(selectedTool, true);
    }
  }, [selectedTool, connectedPlatforms]);

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
                  placeholder="Search by name, description, category, tags, actions…"
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

              {lookupError && (
                <Box
                  bg={colorMode === 'light' ? '#fef2f2' : '#3f1d1d'}
                  border="1px solid"
                  borderColor={colorMode === 'light' ? '#fecaca' : '#7f1d1d'}
                  color={colorMode === 'light' ? '#991b1b' : '#fecaca'}
                  borderRadius="0.5rem"
                  p="0.5rem 0.75rem"
                >
                  {lookupError}
                </Box>
              )}

              {/* Main Content - Fixed Layout */}
              {toolsLoading ? (
                <Box flex="1" minH="0" display="flex" alignItems="center" justifyContent="center">
                  <Spinner thickness="3px" speed="0.6s" emptyColor="gray.200" color="#a1d3ba" size="lg" />
                </Box>
              ) : (
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
                        ))
                    }
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
                        {/* Header: name left, logo right */}
                        <HStack justify="space-between" align="flex-start">
                          <Heading as="h5" fontSize="1.375rem" m="0.25rem 0">
                            {selectedTool.title}
                          </Heading>
                          <Image
                            src={selectedTool.logo}
                            w="64px"
                            h="64px"
                            objectFit="contain"
                            alt={selectedTool.title}
                          />
                        </HStack>

                        {/* Tags row */}
                        <HStack spacing="0.5rem" flexWrap="wrap" mt="0.25rem">
                          {selectedTool.categories && selectedTool.categories.length > 0 && (
                            <>
                              <Box
                                as="span"
                                fontSize="0.75rem"
                                color={colorMode === 'light' ? '#111827' : '#e5e7eb'}
                                bg={colorMode === 'light' ? '#eff6ff' : '#1f2937'}
                                borderRadius="9999px"
                                px="10px"
                                py="2px"
                              >
                                {selectedTool.categories[0]}
                              </Box>
                              {selectedTool.categories.slice(1).map((tag, idx) => (
                                <Box
                                  key={`${tag}-${idx}`}
                                  as="span"
                                  fontSize="0.75rem"
                                  color={colorMode === 'light' ? '#111827' : '#e5e7eb'}
                                  bg={colorMode === 'light' ? '#ecfdf5' : '#064e3b'}
                                  borderRadius="9999px"
                                  px="10px"
                                  py="2px"
                                >
                                  {tag}
                                </Box>
                              ))}
                            </>
                          )}
                        </HStack>

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
              )}
            </VStack>
          </ModalBody>
          <ModalFooter p="0" mt="1rem" display="flex" gap="0.5rem">
            <Button
              h="44px"
              px="20px"
              borderRadius="9999px"
              bg="rgb(244, 233, 220)"
              border="1px solid"
              borderColor={colorMode === 'light' ? '#e7e5e4' : '#374151'}
              color={colorMode === 'light' ? '#262626' : '#e5e7eb'}
              _hover={{
                bg: 'rgb(161, 211, 186)',
                borderColor: 'rgb(161, 211, 186)',
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              h="44px"
              px="20px"
              borderRadius="9999px"
              bg="#ffffff"
              border="1px solid"
              borderColor={selectedTool && isToolConnectable(selectedTool) ? '#e7e5e4' : '#e5e7eb'}
              color={selectedTool && isToolConnectable(selectedTool) ? (colorMode === 'light' ? '#111827' : '#e5e7eb') : '#9ca3af'}
              _hover={selectedTool && isToolConnectable(selectedTool) ? {
                bg: 'rgb(161, 211, 186)',
                borderColor: 'rgb(161, 211, 186)',
              } : {}}
              onClick={() => {
                if (selectedTool && isToolConnectable(selectedTool)) {
                  handleToolConnect(selectedTool);
                }
              }}
              isDisabled={!selectedTool || !isToolConnectable(selectedTool || ({} as any))}
            >
              Connect
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 