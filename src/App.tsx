import { useEffect, useRef, useState } from 'react';
import { Filter, Code2, Maximize2, Search, ChevronDown, Copy, Check } from 'lucide-react';
import { ConstellationGraph, type ConstellationGraphHandle } from './components/constellation-graph';
import { NodeDetailPanel } from './components/node-detail-panel';
import { type GraphNode, bomData, graphData } from './lib/graph-data';

const EVO_LOGO_DARK_URL =
  'https://res.cloudinary.com/snyk/image/upload/snyk-mktg-brandui/brand-logos/evo-logo-dark-mode.svg';

export default function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showJSON, setShowJSON] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const graphRef = useRef<ConstellationGraphHandle>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
      await navigator.clipboard.writeText(JSON.stringify(bomData, null, 2));
      setJsonCopied(true);
      setTimeout(() => setJsonCopied(false), 2000);
    } catch {
      setJsonCopied(false);
    }
  };

  const filters = [
    { id: 'all', label: 'All Components' },
    { id: 'models', label: 'Models' },
    { id: 'agents', label: 'Agents' },
    { id: 'servers', label: 'MCP Servers' },
    { id: 'libraries', label: 'Libraries' },
    { id: 'services', label: 'Services' },
    { id: 'tools', label: 'Tools & Resources' },
  ];

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-card/30 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-4">
          {/* Evo by Snyk Logo (official from evo.ai.snyk.io) */}
          <img
            src={EVO_LOGO_DARK_URL}
            alt="Evo by Snyk"
            className="h-8 w-auto object-contain"
          />
          
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
              <span className="text-foreground/80">{filters.find(f => f.id === filter)?.label}</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border/50 rounded-md shadow-xl py-1 z-50">
                {filters.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFilter(f.id); setShowFilterMenu(false); }}
                    className={`w-full px-3 py-1.5 text-sm text-left hover:bg-secondary/50 transition-colors ${
                      filter === f.id ? 'text-accent' : 'text-foreground/80'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
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
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Graph area */}
        <main className="flex-1 relative">
          <ConstellationGraph
            ref={graphRef}
            onNodeSelect={setSelectedNode}
            selectedNodeId={selectedNode?.id || null}
            filter={filter}
            searchQuery={searchQuery}
          />

          {/* Stats overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
              <div className="text-lg font-semibold text-foreground">{graphData.nodes.length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Components</div>
            </div>
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
              <div className="text-lg font-semibold text-green-400">{graphData.nodes.filter(n => n.type === 'model').length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Models</div>
            </div>
            <div className="bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
              <div className="text-lg font-semibold text-purple-400">{graphData.nodes.filter(n => n.type === 'mcp-server' || n.type === 'mcp-client').length}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">MCP</div>
            </div>
          </div>

          {/* Spec version pill */}
          <div className="absolute top-4 right-80 flex items-center gap-1.5 bg-card/60 backdrop-blur-md rounded-md px-3 py-2 border border-border/30">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">CycloneDX</span>
            <span className="inline-flex items-center justify-center px-2 h-5 rounded text-xs font-medium bg-accent/20 text-accent border border-accent/30">
              v{bomData.specVersion}
            </span>
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
                {JSON.stringify(bomData, null, 2)}
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
