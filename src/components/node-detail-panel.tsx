import { X } from 'lucide-react';
import { type GraphNode, nodeTypeConfig, type BomComponent, type BomService } from '../lib/graph-data';

interface NodeDetailPanelProps {
  node: GraphNode | null;
  onClose: () => void;
}

function isComponent(raw: BomComponent | BomService): raw is BomComponent {
  return 'evidence' in raw || 'modelCard' in raw || 'licenses' in raw || !('endpoints' in raw);
}

export function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const config = nodeTypeConfig[node.type];
  const raw = node.raw;
  const component = isComponent(raw) ? raw : null;
  const service = !isComponent(raw) ? raw : null;

  return (
    <div className="w-96 bg-card/95 backdrop-blur-md border border-border/50 rounded-xl h-auto max-h-[70vh] flex flex-col absolute right-4 top-52 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/30 flex items-start justify-between">
        <h2 className="text-xl font-semibold text-foreground">AI component details</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Type */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Type</label>
          <p className="mt-1 text-base text-foreground">{config.label}</p>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
          <p className="mt-1 text-base text-foreground break-all">{node.fullName}</p>
        </div>

        {/* Publisher (for components) */}
        {component?.publisher && (
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Publisher</label>
            <p className="mt-1 text-base text-foreground">{component.publisher}</p>
          </div>
        )}

        {/* Manufacturer (for models) */}
        {component?.manufacturer && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Manufacturer</label>
            {component.manufacturer.url?.[0] ? (
              <a 
                href={component.manufacturer.url[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 block text-base text-blue-400 hover:underline"
              >
                {component.manufacturer.name}
              </a>
            ) : (
              <p className="mt-1 text-base text-foreground">{component.manufacturer.name}</p>
            )}
          </div>
        )}

        {/* Provider (for services) */}
        {service?.provider && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Provider</label>
            {service.provider.url?.[0] ? (
              <a 
                href={service.provider.url[0]} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-1 block text-base text-blue-400 hover:underline"
              >
                {service.provider.name}
              </a>
            ) : (
              <p className="mt-1 text-base text-foreground">{service.provider.name}</p>
            )}
          </div>
        )}

        {/* Authors */}
        {component?.authors && component.authors.length > 0 && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Authors</label>
            <div className="mt-1 space-y-0.5">
              {component.authors.map((author, i) => (
                <p key={i} className="text-base text-foreground">{author.name}</p>
              ))}
            </div>
          </div>
        )}

        {/* Endpoints (for services) */}
        {service?.endpoints && service.endpoints.length > 0 && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Endpoints</label>
            <div className="mt-1 space-y-1">
              {service.endpoints.map((endpoint, i) => (
                <p key={i} className="text-base text-foreground/90 font-mono text-sm break-all">
                  {endpoint}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Properties (for services) */}
        {service?.properties && service.properties.length > 0 && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Properties</label>
            <div className="mt-2 space-y-2">
              {service.properties.map((prop, i) => (
                <div key={i}>
                  <span className="text-xs text-muted-foreground">{prop.name}</span>
                  <p className="text-base text-foreground font-mono text-sm">{prop.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Occurrences (Code Evidence) */}
        {component?.evidence?.occurrences && component.evidence.occurrences.length > 0 && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Occurrences</label>
            <div className="mt-1 space-y-0.5">
              {component.evidence.occurrences.map((occ, i) => (
                <p key={i} className="text-base text-foreground">
                  {occ.location}, line {occ.line}, column {occ.offset}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* External References */}
        {component?.externalReferences && component.externalReferences.length > 0 && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">External references</label>
            <div className="mt-1 space-y-1">
              {component.externalReferences.map((ref, i) => (
                <a 
                  key={i}
                  href={ref.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-base text-blue-400 hover:underline break-all"
                >
                  {ref.url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Licenses */}
        {component?.licenses && component.licenses.length > 0 && (
          <div className="border-t border-border/30 pt-5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Licenses</label>
            <div className="mt-1 space-y-1">
              {component.licenses.map((lic, i) => (
                lic.license.url ? (
                  <a 
                    key={i}
                    href={lic.license.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block text-base text-blue-400 hover:underline"
                  >
                    {lic.license.id}
                  </a>
                ) : (
                  <p key={i} className="text-base text-foreground">{lic.license.id}</p>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
