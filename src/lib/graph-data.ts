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
    label: 'Tool'
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

// The actual AI-BOM data (CycloneDX format)
export const bomData: CycloneDXBom = {"$schema":"https://cyclonedx.org/schema/bom-1.6.schema.json","bomFormat":"CycloneDX","components":[{"bom-ref":"agent:agents.Agent","evidence":{"identity":[{"field":"name","methods":[{"confidence":1,"technique":"source-code-analysis"}]}],"occurrences":[{"line":9,"location":"mcp/mcp-client.py","offset":13}]},"name":"agents.Agent","type":"application"},{"bom-ref":"agent:create","evidence":{"identity":[{"field":"name","methods":[{"confidence":1,"technique":"source-code-analysis"}]}],"occurrences":[{"line":21,"location":"main.py","offset":18}]},"name":"create","type":"application"},{"bom-ref":"application:Root","name":"Root","type":"application"},{"bom-ref":"mcp-client:agents.mcp.MCPServerSse-http://localhost:8000/sse","evidence":{"identity":[{"field":"name","methods":[{"confidence":1,"technique":"source-code-analysis"}]}],"occurrences":[{"line":28,"location":"mcp/mcp-client.py","offset":16}]},"name":"agents.mcp.MCPServerSse http://localhost:8000/sse","type":"application"},{"bom-ref":"mcp-resource:get_greeting","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":11,"location":"mcp/mcp-server.py","offset":2}]},"name":"get_greeting","type":"data"},{"bom-ref":"mcp-server:DemoServer","evidence":{"identity":[{"field":"name","methods":[{"confidence":1,"technique":"source-code-analysis"}]}],"occurrences":[{"line":3,"location":"mcp/mcp-server.py","offset":7},{"line":5,"location":"mcp/mcp-server.py","offset":2},{"line":11,"location":"mcp/mcp-server.py","offset":2}]},"name":"DemoServer","type":"application"},{"bom-ref":"mcp-server:http://localhost:8000/sse","evidence":{"identity":[{"field":"name","methods":[{"confidence":1,"technique":"source-code-analysis"}]}],"occurrences":[{"line":28,"location":"mcp/mcp-client.py","offset":16}]},"name":"http://localhost:8000/sse","type":"application"},{"authors":[{"name":"Junnan Li"},{"name":"Dongxu Li"},{"name":"Caiming Xiong"},{"name":"Steven Hoi"}],"bom-ref":"model:Salesforce/blip-vqa-base","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":8,"location":"blip.py","offset":13},{"line":8,"location":"blip.py","offset":43},{"line":9,"location":"blip.py","offset":9},{"line":9,"location":"blip.py","offset":50}]},"externalReferences":[{"type":"model-card","url":"https://huggingface.co/Salesforce/blip-vqa-base"}],"licenses":[{"license":{"id":"BSD-3-Clause","url":"https://spdx.org/licenses/BSD-3-Clause.html"}}],"modelCard":{"modelParameters":{"approach":{"type":"self-supervised"},"architectureFamily":"transformer","inputs":[{"format":"image"},{"format":"text"}],"modelArchitecture":"BLIP","outputs":[{"format":"text"}],"task":"visual-question-answering"}},"name":"Salesforce/blip-vqa-base","publisher":"Hugging Face Inc","type":"machine-learning-model"},{"bom-ref":"model:deepseek-reasoner","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.3,"technique":"source-code-analysis"}]}],"occurrences":[{"line":13,"location":"chat.py","offset":14}]},"externalReferences":[{"type":"website","url":"https://api-docs.deepseek.com/api/list-models"}],"manufacturer":{"name":"Hangzhou DeepSeek AI Co., Ltd.","url":["https://deepseek.ai"]},"name":"deepseek-reasoner","type":"machine-learning-model"},{"bom-ref":"model:gpt-3.5-turbo","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":13,"location":"mcp/mcp-client.py","offset":24},{"line":13,"location":"mcp/mcp-client.py","offset":44}]},"externalReferences":[{"type":"website","url":"https://platform.openai.com/docs/models/gpt-3.5-turbo"}],"manufacturer":{"name":"OpenAI, Inc.","url":["https://openai.com"]},"name":"gpt-3.5-turbo","type":"machine-learning-model"},{"bom-ref":"model:gpt-4o-mini","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":21,"location":"main.py","offset":18},{"line":22,"location":"main.py","offset":19}]},"externalReferences":[{"type":"website","url":"https://platform.openai.com/docs/models/gpt-4o-mini"}],"manufacturer":{"name":"OpenAI, Inc.","url":["https://openai.com"]},"name":"gpt-4o-mini","type":"machine-learning-model"},{"bom-ref":"model:sanchit-gandhi/whisper-medium-fleurs-lang-id","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":8,"location":"whisper.py","offset":13},{"line":8,"location":"whisper.py","offset":46},{"line":9,"location":"whisper.py","offset":9},{"line":10,"location":"whisper.py","offset":5}]},"name":"sanchit-gandhi/whisper-medium-fleurs-lang-id","type":"machine-learning-model"},{"bom-ref":"pkg:openai","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":1,"location":"main.py","offset":20},{"line":6,"location":"main.py","offset":14}]},"name":"openai","type":"library"},{"bom-ref":"pkg:transformers","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":6,"location":"blip.py","offset":26},{"line":6,"location":"blip.py","offset":52},{"line":8,"location":"blip.py","offset":13},{"line":9,"location":"blip.py","offset":9},{"line":5,"location":"whisper.py","offset":26},{"line":5,"location":"whisper.py","offset":59},{"line":8,"location":"whisper.py","offset":13},{"line":9,"location":"whisper.py","offset":9}]},"name":"transformers","type":"library"},{"bom-ref":"tool:add","evidence":{"identity":[{"field":"name","methods":[{"confidence":0.9,"technique":"source-code-analysis"}]}],"occurrences":[{"line":5,"location":"mcp/mcp-server.py","offset":2}]},"name":"add","type":"application"}],"dependencies":[{"dependsOn":["agent:agents.Agent","agent:create","mcp-client:agents.mcp.MCPServerSse-http://localhost:8000/sse","mcp-server:DemoServer","model:Salesforce/blip-vqa-base","model:deepseek-reasoner","model:gpt-3.5-turbo","model:gpt-4o-mini","model:sanchit-gandhi/whisper-medium-fleurs-lang-id","pkg:openai","pkg:transformers","service:deepseek"],"ref":"application:Root"},{"dependsOn":["mcp-server:http://localhost:8000/sse"],"ref":"mcp-client:agents.mcp.MCPServerSse-http://localhost:8000/sse"},{"dependsOn":["mcp-resource:get_greeting","tool:add"],"ref":"mcp-server:DemoServer"}],"metadata":{"manufacturer":{"name":"Snyk","url":["https://snyk.io"]}},"services":[{"bom-ref":"service:deepseek","endpoints":["https://api.deepseek.com/chat/completions"],"name":"deepseek","properties":[{"name":"location","value":"chat.py:6"}],"provider":{"name":"Hangzhou DeepSeek AI Co., Ltd.","url":["https://deepseek.ai"]}}],"specVersion":"1.6","version":1};

// Export the converted graph data
export const graphData: GraphData = bomToGraphData(bomData);
