// CycloneDX AI-BOM Types
export interface BomEvidence {
  identity?: Array<{
    field: string;
    methods: Array<{ confidence: number; technique: string }>;
  }>;
  occurrences?: Array<{
    line: number;
    location: string;
    offset: number;
  }>;
}

export interface BomComponent {
  'bom-ref': string;
  name: string;
  type: string;
  evidence?: BomEvidence;
  externalReferences?: Array<{ type: string; url: string }>;
  manufacturer?: { name: string; url?: string[] };
  publisher?: string;
  authors?: Array<{ name: string }>;
  licenses?: Array<{ license: { id: string; url?: string } }>;
  modelCard?: {
    modelParameters?: {
      approach?: { type: string };
      architectureFamily?: string;
      modelArchitecture?: string;
      task?: string;
      inputs?: Array<{ format: string }>;
      outputs?: Array<{ format: string }>;
    };
  };
}

export interface BomService {
  'bom-ref': string;
  name: string;
  endpoints?: string[];
  provider?: { name: string; url?: string[] };
  properties?: Array<{ name: string; value: string }>;
}

export interface BomDependency {
  ref: string;
  dependsOn?: string[];
}

export interface CycloneDXBom {
  $schema?: string;
  bomFormat: string;
  specVersion: string;
  version: number;
  metadata?: {
    manufacturer?: { name: string; url?: string[] };
  };
  components: BomComponent[];
  services?: BomService[];
  dependencies: BomDependency[];
}

// Derived node type from bom-ref prefix
export type NodeType = 
  | 'model'
  | 'agent'
  | 'library'
  | 'mcp-server'
  | 'mcp-client'
  | 'mcp-resource'
  | 'tool'
  | 'service'
  | 'application'
  | 'data';

export interface GraphNode {
  id: string;
  label: string;
  fullName: string;
  type: NodeType;
  raw: BomComponent | BomService;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Constellation ring order: inner to outer. Application is center/separate ring; use this for layout and legend.
export const constellationRingOrder: NodeType[] = [
  'mcp-client', 'mcp-server', 'agent', 'model', 'library', 'service', 'mcp-resource', 'tool', 'data',
];

// Parse bom-ref to determine node type
export function getNodeType(bomRef: string): NodeType {
  if (bomRef.startsWith('model:')) return 'model';
  if (bomRef.startsWith('agent:')) return 'agent';
  if (bomRef.startsWith('pkg:')) return 'library';
  if (bomRef.startsWith('mcp-server:')) return 'mcp-server';
  if (bomRef.startsWith('mcp-client:')) return 'mcp-client';
  if (bomRef.startsWith('mcp-resource:')) return 'mcp-resource';
  if (bomRef.startsWith('tool:')) return 'tool';
  if (bomRef.startsWith('service:')) return 'service';
  if (bomRef.startsWith('application:')) return 'application';
  return 'data';
}

// Convert CycloneDX BOM to graph data
export function bomToGraphData(bom: CycloneDXBom): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add components as nodes
  for (const component of bom.components) {
    const type = getNodeType(component['bom-ref']);
    nodes.push({
      id: component['bom-ref'],
      label: component.name.split('/').pop() || component.name,
      fullName: component.name,
      type,
      raw: component,
    });
  }

  // Add services as nodes
  if (bom.services) {
    for (const service of bom.services) {
      nodes.push({
        id: service['bom-ref'],
        label: service.name,
        fullName: service.name,
        type: 'service',
        raw: service,
      });
    }
  }

  // Add dependencies as edges
  for (const dep of bom.dependencies) {
    if (dep.dependsOn) {
      for (const target of dep.dependsOn) {
        edges.push({ from: dep.ref, to: target });
      }
    }
  }

  return { nodes, edges };
}

// Node type visual configuration
export const nodeTypeConfig: Record<NodeType, { color: string; bgColor: string; borderColor: string; icon: string; label: string }> = {
  'model': { 
    color: '#22c55e', 
    bgColor: 'rgba(34,197,94,0.12)', 
    borderColor: 'rgba(34,197,94,0.35)', 
    icon: '◉',
    label: 'Model'
  },
  'agent': { 
    color: '#3b82f6', 
    bgColor: 'rgba(59,130,246,0.12)', 
    borderColor: 'rgba(59,130,246,0.35)', 
    icon: '●',
    label: 'Agent'
  },
  'library': { 
    color: '#ec4899', 
    bgColor: 'rgba(236,72,153,0.12)', 
    borderColor: 'rgba(236,72,153,0.35)', 
    icon: '◈',
    label: 'Library'
  },
  'mcp-server': { 
    color: '#a855f7', 
    bgColor: 'rgba(168,85,247,0.12)', 
    borderColor: 'rgba(168,85,247,0.35)', 
    icon: '⬢',
    label: 'MCP Server'
  },
  'mcp-client': { 
    color: '#c084fc', 
    bgColor: 'rgba(192,132,252,0.12)', 
    borderColor: 'rgba(192,132,252,0.35)', 
    icon: '⬡',
    label: 'MCP Client'
  },
  'mcp-resource': { 
    color: '#06b6d4', 
    bgColor: 'rgba(6,182,212,0.12)', 
    borderColor: 'rgba(6,182,212,0.35)', 
    icon: '▣',
    label: 'MCP Resource'
  },
  'tool': { 
    color: '#f59e0b', 
    bgColor: 'rgba(245,158,11,0.12)', 
    borderColor: 'rgba(245,158,11,0.35)', 
    icon: '⚙',
    label: 'MCP Tool'
  },
  'service': { 
    color: '#ef4444', 
    bgColor: 'rgba(239,68,68,0.12)', 
    borderColor: 'rgba(239,68,68,0.35)', 
    icon: '◎',
    label: 'Service'
  },
  'application': { 
    color: '#ffffff', 
    bgColor: 'rgba(255,255,255,0.08)', 
    borderColor: 'rgba(255,255,255,0.25)', 
    icon: '◆',
    label: 'Application'
  },
  'data': { 
    color: '#06b6d4', 
    bgColor: 'rgba(6,182,212,0.12)', 
    borderColor: 'rgba(6,182,212,0.35)', 
    icon: '▤',
    label: 'Data'
  },
};

// BOM is injected at build time into <script id="bom-data"> (see docs/html-template.md)

const BOM_SCRIPT_ID = 'bom-data';
const PLACEHOLDER_TOKEN = '{{{PLACEHOLDER_JSON_TOKEN}}}';

/** Minimal valid CycloneDX BOM used when script tag is missing, placeholder, or invalid. */
const MINIMAL_BOM: CycloneDXBom = {
  bomFormat: 'CycloneDX',
  specVersion: '1.6',
  version: 1,
  components: [],
  dependencies: [],
};

function isValidCycloneDXBom(value: unknown): value is CycloneDXBom {
  if (!value || typeof value !== 'object') return false;
  const o = value as Record<string, unknown>;
  return (
    Array.isArray(o.components) &&
    Array.isArray(o.dependencies) &&
    (o.bomFormat === 'CycloneDX' || typeof o.specVersion === 'string')
  );
}

/**
 * Read the default BOM from the DOM (injected at build time into script#bom-data).
 * Returns minimal BOM if the script is missing, contains the template placeholder, or invalid JSON.
 */
export function getDefaultBomFromDOM(): CycloneDXBom {
  if (typeof document === 'undefined') return MINIMAL_BOM;
  const el = document.getElementById(BOM_SCRIPT_ID);
  const raw = el?.textContent?.trim();
  if (!raw || raw === PLACEHOLDER_TOKEN) return MINIMAL_BOM;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isValidCycloneDXBom(parsed)) return parsed;
  } catch {
    // invalid JSON or still placeholder
  }
  return MINIMAL_BOM;
}

/** Convert BOM to graph; use getDefaultBomFromDOM() or uploaded JSON for initial state. */
export function getGraphData(bom: CycloneDXBom): GraphData {
  return bomToGraphData(bom);
}
