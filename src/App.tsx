import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Code2, Maximize2, Search, ChevronDown, ChevronRight, Copy, Check, Upload, Github } from 'lucide-react';
import { ConstellationGraph, type ConstellationGraphHandle } from './components/constellation-graph';
import { NodeDetailPanel } from './components/node-detail-panel';
import { type CycloneDXBom, type GraphNode, type NodeType, getDefaultBomFromDOM, getGraphData, nodeTypeConfig, constellationRingOrder } from './lib/graph-data';

const EVO_LOGO_DARK_URL =
  'https://res.cloudinary.com/snyk/image/upload/snyk-mktg-brandui/brand-logos/evo-logo-dark-mode.svg';

const COMPONENT_FILTERS = [
  { id: 'models', label: 'Models' },
  { id: 'agents', label: 'Agents' },
  { id: 'servers', label: 'MCP Servers' },
  { id: 'libraries', label: 'Libraries' },
  { id: 'services', label: 'Services' },
  { id: 'tools', label: 'Tools & Resources' },
  { id: 'data', label: 'Data' },
] as const;

/** Map node type to header filter id; null if type has no filter (e.g. application). */
function getFilterIdForNodeType(type: NodeType): string | null {
  switch (type) {
    case 'model': return 'models';
    case 'agent': return 'agents';
    case 'mcp-server':
    case 'mcp-client': return 'servers';
    case 'library': return 'libraries';
    case 'service': return 'services';
    case 'tool':
    case 'mcp-resource': return 'tools';
    case 'data': return 'data';
    default: return null;
  }
}

function isValidCycloneDXBom(value: unknown): value is CycloneDXBom {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.components) &&
    Array.isArray(o.dependencies) &&
    (o.bomFormat === 'CycloneDX' || typeof o.specVersion === 'string')
  );
}

export default function App() {
  const [currentBom, setCurrentBom] = useState<CycloneDXBom>(() => getDefaultBomFromDOM());
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showJSON, setShowJSON] = useState(false);
  const [selectedFilterIds, setSelectedFilterIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const graphRef = useRef<ConstellationGraphHandle>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const graphData = useMemo(() => getGraphData(currentBom), [currentBom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const copyJsonToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentBom, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      setJsonCopied(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text) as unknown;
        if (!isValidCycloneDXBom(parsed)) {
          setUploadError('Invalid AI-BOM: must have components, dependencies, and bomFormat/specVersion');
          return;
        }
        setCurrentBom(parsed);
        setSelectedNode(null);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Invalid JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filterButtonLabel =
    selectedFilterIds.size === 0
      ? 'All Components'
      : selectedFilterIds.size === 1
        ? COMPONENT_FILTERS.find((f) => selectedFilterIds.has(f.id))?.label ?? 'Components'
        : `${selectedFilterIds.size} types`;

  const toggleFilter = (id: string) => {
    setSelectedFilterIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilterIds(new Set());
  };

  // Dynamic stats: total + one card per component type present in the data (ordered by constellation ring order)
  const typeCounts = graphData.nodes.reduce<Record<NodeType, number>>(
    (acc, node) => {
      acc[node.type] = (acc[node.type] ?? 0) + 1;
      return acc;
    },
    {} as Record<NodeType, number>
  );
  const typesWithCount = constellationRingOrder.filter((t) => (typeCounts[t] ?? 0) > 0);
  const otherTypes = (Object.keys(typeCounts) as NodeType[]).filter(
    (t) => !constellationRingOrder.includes(t) && (typeCounts[t] ?? 0) > 0
  );
  const statsTypeOrder = [...typesWithCount, ...otherTypes];

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/30 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-4">
          {/* Evo by Snyk Logo (official from evo.ai.snyk.io) */}
          <a href="https://evo.ai.snyk.io/" target="_blank" rel="noopener noreferrer">
            <img
              src={EVO_LOGO_DARK_URL}
              alt="Evo by Snyk"
              className="h-8 w-auto object-contain"
            />
          </a>
          
          <div className="h-6 w-px bg-border/50" />
          
          <span className="text-sm font-medium text-foreground/80">AI-BOM</span>
          
          <div className="h-6 w-px bg-border/50" />
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 h-8 pl-9 pr-10 bg-secondary/40 border border-border/50 rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent/50 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              ⌘K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="h-8 px-3 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md text-sm text-foreground flex items-center gap-2 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="text-foreground/80">{filterButtonLabel}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-1 w-52 bg-popover border border-border/50 rounded-md shadow-xl py-1 z-50">
                {COMPONENT_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFilter(f.id)}
                    className="w-full px-3 py-1.5 text-sm text-left hover:bg-secondary/50 transition-colors flex items-center gap-2"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        selectedFilterIds.has(f.id)
                          ? 'bg-accent border-accent'
                          : 'border-border bg-background'
                      }`}
                      aria-hidden
                    >
                      {selectedFilterIds.has(f.id) && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className={selectedFilterIds.has(f.id) ? 'text-accent' : 'text-foreground/80'}>
                      {f.label}
                    </span>
                  </button>
                ))}
                <div className="my-1 border-t border-border/50" />
                <button
                  type="button"
                  onClick={() => { clearAllFilters(); setShowFilterMenu(false); }}
                  className="w-full px-3 py-1.5 text-sm text-left text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Zoom to fit */}
          <button
            onClick={() => graphRef.current?.zoomToFit()}
            className="h-8 px-3 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md text-sm text-foreground flex items-center gap-2 transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-foreground/80">Zoom to Fit</span>
          </button>

          {/* JSON toggle */}
          <button
            onClick={() => setShowJSON(!showJSON)}
            className={`h-8 px-3 border rounded-md text-sm flex items-center gap-2 transition-all ${
              showJSON 
                ? 'bg-gradient-to-r from-purple-500/20 to-orange-500/20 border-accent/50 text-foreground' 
                : 'bg-secondary/40 hover:bg-secondary/60 border-border/50 text-foreground/80'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Show JSON</span>
          </button>

          {/* Upload JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileSelect}
            aria-label="Upload AI-BOM JSON"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 px-3 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md text-sm text-foreground flex items-center gap-2 transition-colors"
            title="Upload AI-BOM JSON file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-foreground/80">Upload JSON</span>
          </button>

          {/* GitHub repo link */}
          <a
            href="https://github.com/lirantal/ai-bom-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 bg-secondary/40 hover:bg-secondary/60 border border-border/50 rounded-md flex items-center justify-center transition-colors"
            title="View on GitHub"
          >
            <Github className="w-4 h-4 text-foreground/70" />
          </a>
        </div>
      </header>

      {uploadError && (
        <div className="flex items-center justify-between gap-4 px-4 py-2 bg-destructive/15 border-b border-destructive/30 text-sm text-destructive">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="shrink-0 px-2 py-1 rounded hover:bg-destructive/20 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph area */}
        <main className="flex-1 relative">
          <ConstellationGraph
            ref={graphRef}
            graphData={graphData}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id || null}
            selectedFilterIds={Array.from(selectedFilterIds)}
            searchQuery={searchQuery}
          />

          {/* Top-left: stats cards only */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30 shrink-0">
              <div className="text-lg font-semibold text-foreground">{graphData.nodes.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Components</div>
            </div>
            {statsTypeOrder.map((type) => {
              const config = nodeTypeConfig[type];
              const count = typeCounts[type] ?? 0;
              const filterId = getFilterIdForNodeType(type);
              const isClickable = filterId !== null;
              const isOnlyFilterActive = isClickable && selectedFilterIds.size === 1 && selectedFilterIds.has(filterId!);
              const handleCardClick = isClickable
                ? () => setSelectedFilterIds(isOnlyFilterActive ? new Set() : new Set([filterId!]))
                : undefined;
              return (
                <div
                  key={type}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onClick={handleCardClick}
                  onKeyDown={
                    isClickable
                      ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick?.(); } }
                      : undefined
                  }
                  className={`bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30 shrink-0 ${
                    isClickable ? 'cursor-pointer hover:bg-card/80 hover:border-border/50 transition-colors' : ''
                  }`}
                  title={isClickable ? (isOnlyFilterActive ? 'Clear filter (show all)' : `Show only ${config.label}`) : undefined}
                >
                  <div className="text-lg font-semibold" style={{ color: config.color }}>
                    {count}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {config.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom-left: Components legend (collapsible) + CycloneDX side by side */}
          <div className="absolute bottom-4 left-4 flex items-end gap-2">
            <div
              className={`bg-card/80 backdrop-blur-sm rounded-md border border-border/50 w-fit overflow-hidden flex flex-col ${!legendExpanded ? 'h-9' : ''}`}
            >
              <button
                type="button"
                onClick={() => setLegendExpanded((e) => !e)}
                className={`flex items-center gap-2 px-3 text-left text-xs text-muted-foreground hover:bg-secondary/30 transition-colors ${!legendExpanded ? 'h-full min-h-0 shrink-0' : 'w-full py-2'}`}
              >
                <span className="text-muted-foreground">Components</span>
                {legendExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
              {legendExpanded && (
                <div className="px-3 pb-3 pt-0 grid grid-cols-2 gap-x-4 gap-y-1">
                  {([...constellationRingOrder, 'application'] as NodeType[]).map((type) => {
                    const config = nodeTypeConfig[type];
                    if (!config) return null;
                    return (
                      <div key={type} className="flex items-center gap-2 text-xs">
                        <span style={{ color: config.color }}>{config.icon}</span>
                        <span className="text-foreground/70">{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="h-9 flex items-center gap-1.5 bg-card/60 backdrop-blur-md rounded-md px-3 border border-border/30 shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">CycloneDX</span>
              <span className="inline-flex items-center justify-center px-2 h-5 rounded text-xs font-medium bg-accent/20 text-accent border border-accent/30">
                v{currentBom.specVersion}
              </span>
            </div>
          </div>

          {/* JSON panel */}
          {showJSON && (
            <div className="absolute bottom-4 left-4 right-4 max-h-80 bg-card/90 backdrop-blur-md border border-border/50 rounded-md overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-secondary/20">
                <span className="text-xs font-medium text-foreground">Raw CycloneDX AI-BOM</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={copyJsonToClipboard}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                    title="Copy JSON"
                  >
                    {jsonCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => setShowJSON(false)}
                    className="p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                    title="Close"
                  >
                    <Code2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <pre className="p-3 text-xs font-mono text-green-400 overflow-auto max-h-64">
                {JSON.stringify(currentBom, null, 2)}
              </pre>
            </div>
          )}

          {/* Detail panel */}
          <NodeDetailPanel 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
          />
        </main>
      </div>
    </div>
  );
}
