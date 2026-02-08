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
import '../index.css';
import './ToolCatalogModal.css';

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
      return [];
    }
    //   return [
    //     {
    //       id: '1',
    //       name: 'apaleo-staff',
    //       title: 'Apaleo Staff',
    //       shortDesc: 'Apaleo PMS for all staff',
    //       longDesc: '<p>Apaleo PMS for all staff</p>',
    //       provider: 'Apaleo',
    //       categories: ['travel', 'pms'],
    //       logo: 'https://ui-avatars.com/api/?name=Ap&background=000&color=fff&size=64',
    //       learnMore: '#',
    //       actions: [{ title: 'Get Reservations' }, { title: 'Update Booking' }, { title: 'Check Availability' }]
    //     },
    //     {
    //       id: '2',
    //       name: 'linksrez',
    //       title: 'Linksrez',
    //       shortDesc: 'Unified API tool with full PMS, RMS, and hotel intelligence for high-margin direct bookings',
    //       longDesc: '<p>Unified API tool with full PMS, RMS, and hotel intelligence for high-margin direct bookings</p>',
    //       provider: 'LinksRez',
    //       categories: ['travel', 'booking'],
    //       logo: 'https://ui-avatars.com/api/?name=Li&background=fff&color=000&size=64&bold=true',
    //       learnMore: '#',
    //       actions: [{ title: 'Create Booking' }, { title: 'Get Rates' }, { title: 'Update Inventory' }]
    //     },
    //     {
    //       id: '3',
    //       name: 'apaleo-revenue',
    //       title: 'Apaleo Revenue',
    //       shortDesc: 'Apaleo PMS for Revenue teams',
    //       longDesc: '<p>Apaleo PMS for Revenue teams</p>',
    //       provider: 'Apaleo',
    //       categories: ['finance', 'revenue'],
    //       logo: 'https://ui-avatars.com/api/?name=AR&background=000&color=fff&size=64',
    //       learnMore: '#',
    //       actions: [{ title: 'Revenue Reports' }, { title: 'Pricing Strategy' }, { title: 'Forecast Analysis' }]
    //     },
    //     {
    //       id: '4',
    //       name: 'openuv',
    //       title: 'Real-time UV Index API',
    //       shortDesc: 'Provides the current UV Index and 5 day Hourly UV Index Forecast.',
    //       longDesc: '<p>Provides the current UV Index and 5 day Hourly UV Index Forecast.</p>',
    //       provider: 'OpenUV',
    //       categories: ['weather', 'data'],
    //       logo: 'https://ui-avatars.com/api/?name=UV&background=fff&color=000&size=64',
    //       learnMore: '#',
    //       actions: [{ title: 'Get UV Index' }, { title: 'Get Forecast' }]
    //     },
    //     {
    //       id: '5',
    //       name: 'leadspicker',
    //       title: 'Leadspicker API',
    //       shortDesc: 'Lead generation automation.',
    //       longDesc: '<p>Lead generation automation.</p>',
    //       provider: 'Leadspicker',
    //       categories: ['sales', 'marketing'],
    //       logo: 'https://ui-avatars.com/api/?name=Lp&background=3b82f6&color=fff&size=64',
    //       learnMore: '#',
    //       actions: [{ title: 'Generate Leads' }, { title: 'Export Contacts' }, { title: 'Track Campaigns' }]
    //     },
    //     {
    //       id: '6',
    //       name: 'stripe',
    //       title: 'Stripe Payments',
    //       shortDesc: 'Payment processing and financial infrastructure',
    //       longDesc: '<p>Complete payment processing solution with support for multiple currencies and payment methods.</p>',
    //       provider: 'Stripe',
    //       categories: ['finance', 'payments'],
    //       logo: 'https://ui-avatars.com/api/?name=St&background=635bff&color=fff&size=64',
    //       learnMore: '#',
    //       actions: [{ title: 'Process Payment' }, { title: 'Create Invoice' }, { title: 'Manage Subscriptions' }, { title: 'Refund Transaction' }]
    //     }
    //   ];
    // }

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
      <>
        {selectedToolActions.map((action, index) => (
          <Box
            key={index}
            className="tool-provider"
            dangerouslySetInnerHTML={{ __html: action.title }}
          />
        ))}
      </>
    );
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" closeOnOverlayClick={false} isCentered>
        <ModalOverlay bg="rgba(0,0,0,0.4)" backdropFilter="blur(6px)" />
        <ModalContent
          w="90vw"
          h="80vh"
          maxW="90vw"
          bg="var(--sand-060, #f9f3ec)"
          border="2px solid"
          borderColor="var(--green-300, #a1d3ba)"
          borderRadius="1.25rem"
          p="1.5rem"
          my="0"
          boxSizing="border-box"
          display="flex"
          flexDirection="column"
          position="relative"
          fontFamily="'Montserrat', sans-serif"
          color="rgb(15, 15, 15)"
          fontSize="1rem"
          fontWeight="400"
          lineHeight="1.5"
        >
          <ModalCloseButton
            className="close-modal"
            aria-label="Close modal"
            fontSize="20px"
            fontWeight="300"
            fontFamily="'Open Sans', sans-serif"
            w="32px"
            h="32px"
            color="rgb(161, 211, 186)"
            position="absolute"
            top="12px"
            right="12px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="transparent"
            border="none"
            outline="none"
            boxShadow="none"
            cursor="pointer"
            transition="background 0.2s"
            _focus={{ boxShadow: 'none', outline: 'none' }}
            _hover={{ color: 'var(--green-400, #82c4a3)', bg: 'var(--sand-100, #f4e9dc)', borderRadius: '50%' }}
          />

          {/* Title - outside modal body like reference HTML */}
          <Heading
            as="h4"
            id="portal-modal-title"
            className="portal-h4"
            color="rgb(15, 15, 15)"
            m="8px 0"
            fontFamily="Montserrat, sans-serif"
            fontSize="20.8px"
            lineHeight="25.4176px"
            fontWeight="400"
            display="block"
            boxSizing="border-box"
          >
            Connect a Tool
          </Heading>

          <ModalBody className="modal-body" p="0" m="1rem 0" display="flex" flexDirection="column" overflow="hidden" h="100%" flex="1">
            <VStack spacing="0" align="stretch" h="100%" minH="0">
              {/* Subtitle - inside modal body like reference HTML */}
              <Text
                as="p"
                className="modal-subtitle"
                flexShrink={0}
              >
                Select systems and tools you wish to make available for the AI assistants in your organization.
              </Text>

              {/* Search */}
              <input
                id="catalog-search"
                type="text"
                placeholder="Search by name, description, category, tags, actions…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

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
                <Grid
                  className="catalog-layout"
                  templateColumns="1fr 1fr"
                  gap="1rem"
                  flex="1 1 auto"
                  h="100%"
                  minH="0"
                  minW="0"
                  overflow="hidden"
                >
                  {/* Tools Grid */}
                  <Box
                    className="card-grid-wrapper"
                    h="100%"
                    minH="0"
                    minW="0"
                    maxH="100%"
                    maxW="100%"
                    overflowY="auto"
                    overflowX="hidden"
                    pr=".5rem"
                  >
                    <Box
                      id="catalog-card-grid"
                      className="card-grid"
                      display="grid"
                      rowGap=".5rem"
                      alignContent="start"
                    >
                      {filteredTools.map((tool) => (
                        <Box
                          className={`card ${selectedTool?.id === tool.id ? 'active' : ''}`}
                          key={tool.id}
                          bg={selectedTool?.id === tool.id ? 'rgb(255, 255, 255)' : 'rgb(253, 250, 247)'}
                          color="rgb(2, 2, 2)"
                          border="1px solid"
                          borderColor={selectedTool?.id === tool.id ? 'rgb(244, 233, 220)' : 'rgb(244, 233, 220)'}
                          borderRadius="4px"
                          cursor="pointer"
                          p="0.75rem"
                          minH="88px"
                          maxH="140px"
                          overflow="hidden"
                          boxShadow="rgba(20, 20, 43, 0.06) 0px 2px 7px 0px"
                          transition="0.2s"
                          _hover={{
                            bg: selectedTool?.id === tool.id ? 'rgb(255, 255, 255)' : 'rgb(254, 253, 251)',
                            boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 8px 0px',
                            borderColor: 'rgb(161, 211, 186)',
                          }}
                          onClick={() => handleToolSelect(tool)}
                        >
                          <HStack className="card-header" gap="0.75rem" mb="0">
                            <Image
                              className="card-logo"
                              src={tool.logo}
                              w="64px"
                              h="64px"
                              objectFit="contain"
                              alt={tool.title}
                            />
                            <VStack
                              className="card-title"
                              align="start"
                              flex="1"
                              gap="0"
                              fontFamily="'Open Sans', sans-serif"
                              fontSize="16px"
                              fontWeight="300"
                              color="rgb(2, 2, 2)"
                              lineHeight="24px"
                              h="64px"
                              cursor="pointer"
                              boxSizing="border-box"
                            >
                              <Text
                                className="card-name"
                                fontSize="16px"
                                fontFamily="'Open Sans', sans-serif"
                                fontWeight="400"
                                color="rgb(2, 2, 2)"
                                display="block"
                                lineHeight="24px"
                                m="0 0 2px 0"
                                pr="21px"
                                cursor="pointer"
                                boxSizing="border-box"
                              >
                                {tool.title}
                              </Text>
                              <Text
                                className="card-desc"
                                fontSize="14.4px"
                                fontFamily="'Open Sans', sans-serif"
                                fontWeight="300"
                                color="rgb(41, 41, 41)"
                                lineHeight="15.84px"
                                overflow="hidden"
                                textOverflow="ellipsis"
                                display="-webkit-box"
                                cursor="pointer"
                                boxSizing="border-box"
                                css={{
                                  WebkitLineClamp: 2,
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
                    </Box>
                  </Box>

                  {/* Details Panel */}
                  <Box
                    id="catalog-details-panel"
                    className="details-panel"
                    bg={selectedTool ? '#fff' : 'var(--sand-040, #fdfaf7)'}
                    border="1px solid"
                    borderColor="var(--sand-100, #f4e9dc)"
                    borderRadius="0.25rem"
                    p="16px"
                    h="100%"
                    minH="0"
                    minW="0"
                    maxH="100%"
                    maxW="100%"
                    overflowY="auto"
                    overflowX="hidden"
                    display="flex"
                    flexDirection="column"
                    boxSizing="border-box"
                  >
                    {!selectedTool ? (
                      <Image
                        className="empty-state"
                        src="https://cdn.prod.website-files.com/657ae60d92ed823479730a3f/67f93be4b1e4cf832343dce6_inhotel-pineapple-sand-060.svg"
                        alt="Pineapple background image"
                        m="auto"
                        maxH="80%"
                        maxW="80%"
                        w="auto"
                        h="auto"
                        fontFamily="Open Sans,sans-serif"
                        fontWeight="300"
                        lineHeight="1.667rem"
                        display="inline-block"
                        overflow="clip"
                        overflow-clip-margin="content-box"
                      />
                    ) : (
                      <Box display="flex" flexDirection="column" h="100%">
                        {/* Header: name left, logo right */}
                        <Box className="details-top">
                          <Box className="tool-name" as="h5">
                            {selectedTool.title}
                          </Box>
                          <Image
                            className="detail-logo"
                            src={selectedTool.logo}
                            alt={selectedTool.title}
                          />
                        </Box>

                        {/* Tags row */}
                        <Box className="detail-tags-row">
                          {selectedTool.categories && selectedTool.categories.length > 0 && (
                            <>
                              <Box className="tag-category" as="span">
                                {selectedTool.categories[0]}
                              </Box>
                              {selectedTool.categories.slice(1).map((tag, idx) => (
                                <Box className="tag-item" key={`${tag}-${idx}`} as="span">
                                  {tag}
                                </Box>
                              ))}
                            </>
                          )}
                        </Box>

                        {/* Details grid */}
                        <Box className="detail-grid">
                          <Box className="field-label">Provider</Box>
                          <Box className="tool-provider field-value">
                            {selectedTool.provider}
                          </Box>

                          <Box className="field-label">Description</Box>
                          <Box
                            className="long-desc field-value"
                            dangerouslySetInnerHTML={{ __html: selectedTool.longDesc }}
                          />

                          <Box className="field-label">Actions ({selectedToolActions.length})</Box>
                          <Box className="actions-list field-value">
                            {renderActionsList()}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Grid>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter className="button-row" p="0" mt="1rem" display="flex" gap="1rem" justifyContent="flex-end">
            <Button
              className="button sand-green slim"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px="24px"
              py="8px"
              fontFamily="Montserrat, sans-serif"
              fontSize="18px"
              fontWeight="300"
              lineHeight="19.998px"
              h="38px"
              borderRadius="20px"
              bg="rgb(244, 233, 220)"
              border="1px solid rgb(233, 212, 185)"
              color="rgb(15, 15, 15)"
              boxShadow="rgba(20, 20, 43, 0.06) 0px 4px 10px 0px"
              boxSizing="border-box"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                bg: 'rgb(161, 211, 186)',
                borderColor: 'rgb(161, 211, 186)',
                transform: 'translateY(-3px)',
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="button white-green slim"
              display="flex"
              alignItems="center"
              justifyContent="center"
              px="24px"
              py="8px"
              fontFamily="Montserrat, sans-serif"
              fontSize="18px"
              fontWeight="300"
              lineHeight="19.998px"
              h="38px"
              borderRadius="20px"
              bg="rgb(255, 255, 255)"
              border="1px solid rgb(191, 191, 191)"
              color={selectedTool && isToolConnectable(selectedTool) ? 'rgb(15, 15, 15)' : '#9ca3af'}
              boxShadow="rgba(20, 20, 43, 0.06) 0px 4px 10px 0px"
              boxSizing="border-box"
              cursor={selectedTool && isToolConnectable(selectedTool) ? 'pointer' : 'not-allowed'}
              transition="all 0.2s"
              _hover={selectedTool && isToolConnectable(selectedTool) ? {
                bg: 'rgb(161, 211, 186)',
                borderColor: 'rgb(161, 211, 186)',
                color: 'rgb(15, 15, 15)',
                transform: 'translateY(-3px)',
              } : {}}
              _disabled={{
                opacity: 0.5,
                cursor: 'not-allowed',
              }}
              pointerEvents="auto"
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
      </Modal >
    </>
  );
}; 