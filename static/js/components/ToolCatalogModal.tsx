import React, { useState, useEffect, useRef } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { Tool, ToolAction, APIResponse, KnowledgeAPIResponse, ToolCatalogModalProps } from '../types/toolCatalog';
import { ConnectionPlatform } from '../types/link';
import useGlobal from '../logic/hooks/useGlobal';

// Declare agGrid globally
declare global {
  interface Window {
    agGrid: any;
  }
}

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
  const [agGridLoaded, setAgGridLoaded] = useState(false);
  const gridApiRef = useRef<any>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  const [colorMode] = useGlobal(['colormode', 'selected']);

  // API URLs
  const API_URL = 'https://backend.inhotel.io/tool/nondefault';
  const KNOWLEDGE_API_URL = 'https://platform-backend.inhotel.io/v1/knowledge';

  // Load AG Grid from CDN
  useEffect(() => {
    const loadAgGrid = () => {
      if (window.agGrid) {
        setAgGridLoaded(true);
        return;
      }

      // Check if already loading
      if (document.querySelector('script[src*="ag-grid"]')) {
        return;
      }

      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-grid.css';
      document.head.appendChild(cssLink);

      const cssTheme = document.createElement('link');
      cssTheme.rel = 'stylesheet';
      cssTheme.href = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/styles/ag-theme-quartz.css';
      document.head.appendChild(cssTheme);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/ag-grid-community@31.0.3/dist/ag-grid-community.min.js';
      script.onload = () => {
        setAgGridLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadAgGrid();
  }, []);

  // Fetch tools from API
  const fetchTools = async (): Promise<Tool[]> => {
    try {
      const res = await fetch(API_URL, { cache: 'no-store' });
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

  // Initialize AG Grid
  const initializeGrid = (container: HTMLElement) => {
    if (!window.agGrid) return;
    
    if (gridApiRef.current) {
      gridApiRef.current.destroy();
      gridApiRef.current = null;
    }

    const columnDefs = [
      {
        headerName: 'TITLE',
        field: 'title',
        flex: 3,
        minWidth: 200,
        cellStyle: {
          fontWeight: '500',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'normal',
          lineHeight: '1.3',
          padding: '8px',
          display: 'flex',
          alignItems: 'flex-start'
        },
        autoHeight: true
      },
      {
        headerName: 'TAGS',
        field: 'tags',
        flex: 2,
        minWidth: 150,
        cellRenderer: function(params: any) {
          const tags = params.value;
          if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return '<div class="tags-cell"><span class="no-tags">No tags</span></div>';
          }
          
          const tagElements = tags.map((tag: string) => 
            `<span class="tag-badge">${tag}</span>`
          ).join('');
          
          return `<div class="tags-cell">${tagElements}</div>`;
        },
        cellStyle: {
          padding: '8px',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'normal',
          display: 'flex',
          alignItems: 'flex-start'
        },
        autoHeight: true
      }
    ];

    const gridOptions = {
      columnDefs: columnDefs,
      rowData: selectedToolActions,
      defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,
        wrapText: true
      },
      pagination: true,
      paginationPageSize: 10,
      domLayout: 'normal',
      rowHeight: null,
      getRowHeight: function() {
        return 'auto';
      },
      headerHeight: 45,
      animateRows: true,
      rowSelection: 'single',
      suppressHorizontalScroll: false,
      suppressColumnVirtualisation: true
    };

    try {
      gridApiRef.current = window.agGrid.createGrid(container, gridOptions);
    } catch (error) {
      console.warn('Failed to create AG Grid:', error);
    }
  };

  // Update grid data
  const updateGridData = (actions: ToolAction[]) => {
    if (gridApiRef.current) {
      gridApiRef.current.setGridOption('rowData', actions);
      gridApiRef.current.sizeColumnsToFit();
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
      
      // Initialize AG Grid after actions are loaded and component updates
      if (agGridLoaded && gridContainerRef.current && actions.length > 0) {
        setTimeout(() => {
          if (gridContainerRef.current) {
            initializeGrid(gridContainerRef.current);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
      setSelectedToolActions([]);
    } finally {
      setActionsLoading(false);
    }
  };

  // Update grid when AG Grid loads and we have actions
  useEffect(() => {
    if (agGridLoaded && gridContainerRef.current && selectedToolActions.length > 0 && selectedTool) {
      setTimeout(() => {
        if (gridContainerRef.current) {
          initializeGrid(gridContainerRef.current);
        }
      }, 100);
    }
  }, [agGridLoaded, selectedToolActions, selectedTool]);

  // Handle tool connection
  const handleToolConnect = (tool: Tool) => {
    const platform = connectedPlatforms.find(
      (p) => p.title === tool.name || p.title === tool.title || p.name === tool.name
    );

    if (!platform || !platform.connectionDefinitionId) {
      console.warn(`No matching platform found for tool: ${tool.name}`);
      // You could show a toast notification here if needed
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

  // Load tools on mount
  useEffect(() => {
    const loadTools = async () => {
      if (!fetched) {
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
  }, [fetched]);

  // Handle search
  useEffect(() => {
    filterTools(searchQuery);
  }, [searchQuery, allTools]);

  // Render actions table (fallback if AG Grid not available)
  const renderActionsTable = () => {
    if (agGridLoaded && selectedToolActions.length > 0) {
      return (
        <Box 
          ref={gridContainerRef}
          className="ag-theme-quartz" 
          w="100%"
          h="300px"
          minH="200px"
          overflow="hidden"
        />
      );
    }

    // Fallback table
    return (
      <TableContainer w="100%" h="300px" overflowY="auto">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>TITLE</Th>
              <Th>TAGS</Th>
            </Tr>
          </Thead>
          <Tbody>
            {selectedToolActions.map((action, index) => (
              <Tr key={index}>
                <Td fontWeight="500">{action.title}</Td>
                <Td>
                  {action.tags && action.tags.length > 0 ? (
                    <Box display="flex" flexWrap="wrap" gap="0.25rem">
                      {action.tags.map((tag, tagIndex) => (
                        <Box
                          key={tagIndex}
                          bg="#ecfdf5"
                          color="#047857"
                          px="0.4rem"
                          py="0.15rem"
                          borderRadius="0.2rem"
                          fontSize="0.75rem"
                          border="1px solid #bbf7d0"
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Text color="gray.400" fontStyle="italic" fontSize="0.85rem">
                      No tags
                    </Text>
                  )}
                </Td>
              </Tr>
            ))}
            {selectedToolActions.length === 0 && !actionsLoading && (
              <Tr>
                <Td colSpan={2} textAlign="center" color="gray.500">
                  No actions available
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <style>
        {`
          /* AG Grid customization */
          .ag-theme-quartz {
            font-family: 'Exo', sans-serif;
            --ag-background-color: var(--neutral--000);
            --ag-foreground-color: var(--sand-900);
            --ag-active-color: var(--green-200);
            --ag-font-size: 0.9rem;
            --ag-line-height: 1.2;
            --ag-border-radius: 0.5rem;
            --ag-border-color: var(--sand-100);
            --ag-wrapper-border-radius: 0.5rem;
            --ag-grid-size: 6px;
            --ag-checkbox-checked-color: var(--neutral--500);
            --ag-checkbox-unchecked-color: var(--neutral--500);
            --ag-input-focus-box-shadow: none;
          }

          .ag-theme-quartz .ag-header,
          .ag-theme-quartz .ag-header-cell {
            background-color: var(--sand-100);
            font-size: 0.8rem;
            font-weight: 600;
            color: var(--sand-900);
          }

          .ag-header-cell-sortable .ag-header-cell-label {
            font-weight: 600;
          }

          .ag-theme-quartz .ag-cell {
            border-right: 1px solid var(--sand-100);
            padding: 8px;
          }

          .ag-theme-quartz .ag-row-hover {
            background-color: var(--green-200);
          }

          .ag-theme-quartz .ag-row {
            border-bottom: 1px solid var(--sand-100);
          }

          .tags-cell {
            display: flex;
            flex-wrap: wrap;
            gap: 0.25rem;
            align-items: flex-start;
            padding: 0.25rem 0;
            width: 100%;
            box-sizing: border-box;
          }

          .tag-badge {
            background: var(--green-050);
            color: var(--green-700);
            padding: 0.15rem 0.4rem;
            border-radius: 0.2rem;
            font-size: 0.75rem;
            border: 1px solid var(--green-200);
            white-space: nowrap;
            flex-shrink: 0;
          }

          .no-tags {
            color: var(--sand-400);
            font-style: italic;
            font-size: 0.8rem;
          }

          :root {
            --sand-060: #f8f6f3;
            --green-300: #10b981;
            --green-050: #ecfdf5;
            --green-200: #bbf7d0;
            --green-700: #047857;
            --sand-200: #e7e5e4;
            --sand-400: #a8a29e;
            --sand-100: #f5f5f4;
            --sand-040: #faf9f7;
            --sand-900: #1c1917;
            --neutral--000: #ffffff;
            --neutral--950: #0a0a0a;
            --neutral--900: #171717;
            --neutral--800: #262626;
          }
        `}
      </style>

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
                          <Text fontSize="0.9rem" color={colorMode === 'light' ? '#a8a29e' : '#6b7280'} fontWeight="300">
                            Provider
                          </Text>
                          <Text fontSize="1rem" color={colorMode === 'light' ? '#262626' : '#d1d5db'} m="0">
                            {selectedTool.provider}
                          </Text>

                          <Text fontSize="0.9rem" color={colorMode === 'light' ? '#a8a29e' : '#6b7280'} fontWeight="300">
                            Description
                          </Text>
                          <Box
                            fontSize="1rem"
                            color={colorMode === 'light' ? '#262626' : '#d1d5db'}
                            lineHeight="1.2"
                            dangerouslySetInnerHTML={{ __html: selectedTool.longDesc }}
                          />
                        </Grid>

                        {/* Actions Section */}
                        <VStack spacing="1rem" flex="1" align="stretch" minH="0">
                          <Box 
                            display="flex" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            pb="0.5rem" 
                            borderBottom="1px solid" 
                            borderBottomColor={colorMode === 'light' ? '#e7e5e4' : '#374151'}
                          >
                            <Heading as="h6" fontSize="1.1rem" fontWeight="600" color={colorMode === 'light' ? '#0a0a0a' : '#f5f5f4'} m="0">
                              Available Actions {!actionsLoading && selectedToolActions.length > 0 && `(${selectedToolActions.length})`}
                            </Heading>
                            {actionsLoading && (
                              <Text color={colorMode === 'light' ? '#a8a29e' : '#6b7280'} fontStyle="italic">
                                Loading actions...
                              </Text>
                            )}
                          </Box>

                          <Box flex="1" minH="0">
                            {renderActionsTable()}
                          </Box>
                        </VStack>
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