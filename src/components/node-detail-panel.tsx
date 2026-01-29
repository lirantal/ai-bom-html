import { X, ExternalLink, FileCode, MapPin } from 'lucide-react';
import { type GraphNode, nodeTypeConfig, type BomComponent, type BomService } from '../lib/graph-data';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

function isComponent(raw: BomComponent | BomService): raw is BomComponent {
  return 'evidence' in raw || 'modelCard' in raw || 'licenses' in raw;
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const config = nodeTypeConfig[node.type];
  const raw = node.raw;
  const component = isComponent(raw) ? raw : null;
  const service = !isComponent(raw) ? raw : null;

  return (
    <div className="w-80 bg-card/90 backdrop-blur-md border-l border-border/50 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-md flex items-center justify-center text-xl"
            style={{ 
              backgroundColor: config.bgColor,
              borderColor: config.borderColor,
              borderWidth: 1,
            }}
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <div>
            <h3 className="font-medium text-foreground">{node.label}</h3>
            <p className="text-xs text-muted-foreground">{config.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Asset Name</label>
          <p className="mt-1.5 text-sm font-medium text-foreground break-all">{node.fullName}</p>
        </div>

        {/* BOM Reference */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">BOM Reference</label>
          <p className="mt-1.5 text-xs font-mono text-foreground/60 bg-secondary/30 border border-border/30 rounded-md px-2 py-1.5 break-all">
            {node.id}
          </p>
        </div>

        {/* Manufacturer / Publisher / Provider */}
        {component?.manufacturer && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Manufacturer</label>
            <p className="mt-1.5 text-sm text-foreground/80">{component.manufacturer.name}</p>
            {component.manufacturer.url?.[0] && (
              <a 
                href={component.manufacturer.url[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink size={10} />
                {component.manufacturer.url[0]}
              </a>
            )}
          </div>
        )}

        {component?.publisher && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Publisher</label>
            <p className="mt-1.5 text-sm text-foreground/80">{component.publisher}</p>
          </div>
        )}

        {service?.provider && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Provider</label>
            <p className="mt-1.5 text-sm text-foreground/80">{service.provider.name}</p>
            {service.provider.url?.[0] && (
              <a 
                href={service.provider.url[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-accent hover:underline flex items-center gap-1 mt-1"
              >
                <ExternalLink size={10} />
                {service.provider.url[0]}
              </a>
            )}
          </div>
        )}

        {/* Service Endpoints */}
        {service?.endpoints && service.endpoints.length > 0 && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Endpoints</label>
            <div className="mt-1.5 space-y-1">
              {service.endpoints.map((endpoint, i) => (
                <p key={i} className="text-xs font-mono text-foreground/70 bg-secondary/30 rounded px-2 py-1 break-all">
                  {endpoint}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Authors */}
        {component?.authors && component.authors.length > 0 && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Authors</label>
            <p className="mt-1.5 text-sm text-foreground/80">
              {component.authors.map(a => a.name).join(', ')}
            </p>
          </div>
        )}

        {/* License */}
        {component?.licenses && component.licenses.length > 0 && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">License</label>
            <div className="mt-1.5">
              {component.licenses.map((lic, i) => (
                <span key={i} className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-500/10 text-green-400 border border-green-500/30">
                  {lic.license.id}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Model Card */}
        {component?.modelCard?.modelParameters && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Model Details</label>
            <div className="mt-1.5 bg-secondary/30 border border-border/30 rounded-md p-3 space-y-2 text-xs">
              {component.modelCard.modelParameters.task && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Task</span>
                  <span className="text-foreground/80">{component.modelCard.modelParameters.task}</span>
                </div>
              )}
              {component.modelCard.modelParameters.modelArchitecture && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Architecture</span>
                  <span className="text-foreground/80">{component.modelCard.modelParameters.modelArchitecture}</span>
                </div>
              )}
              {component.modelCard.modelParameters.architectureFamily && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Family</span>
                  <span className="text-foreground/80">{component.modelCard.modelParameters.architectureFamily}</span>
                </div>
              )}
              {component.modelCard.modelParameters.inputs && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Inputs</span>
                  <span className="text-foreground/80">
                    {component.modelCard.modelParameters.inputs.map(i => i.format).join(', ')}
                  </span>
                </div>
              )}
              {component.modelCard.modelParameters.outputs && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outputs</span>
                  <span className="text-foreground/80">
                    {component.modelCard.modelParameters.outputs.map(o => o.format).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External References */}
        {component?.externalReferences && component.externalReferences.length > 0 && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">External References</label>
            <div className="mt-1.5 space-y-1">
              {component.externalReferences.map((ref, i) => (
                <a 
                  key={i}
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-accent hover:underline"
                >
                  <ExternalLink size={10} />
                  <span className="truncate">{ref.type}: {ref.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Code Evidence / Occurrences */}
        {component?.evidence?.occurrences && component.evidence.occurrences.length > 0 && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <FileCode size={10} />
              Code Evidence
            </label>
            <div className="mt-1.5 space-y-2">
              {component.evidence.occurrences.map((occ, i) => (
                <div 
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-md bg-secondary/30 border border-border/30"
                >
                  <MapPin size={12} className="text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-foreground/80 truncate">{occ.location}</p>
                    <p className="text-[10px] text-muted-foreground">Line {occ.line}, offset {occ.offset}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confidence */}
        {component?.evidence?.identity?.[0]?.methods?.[0]?.confidence !== undefined && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Detection Confidence</label>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${component.evidence.identity[0].methods[0].confidence * 100}%`,
                    backgroundColor: config.color 
                  }}
                />
              </div>
              <span className="text-xs text-foreground/60">
                {Math.round(component.evidence.identity[0].methods[0].confidence * 100)}%
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              via {component.evidence.identity[0].methods[0].technique}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <div className="text-[10px] text-muted-foreground">
          CycloneDX AI-BOM v1.6
        </div>
      </div>
    </div>
  );
}
