import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { constellationRingOrder, nodeTypeConfig, type GraphData, type GraphNode } from '../lib/graph-data';
import { fuzzyMatchAny } from '../lib/fuzzy-match';

interface NodePosition {
  x: number;
  y: number;
  node: GraphNode;
  scale: number;
  angle: number;
  radius: number;
}

export interface ConstellationGraphHandle {
  zoomToFit: () => void;
}

function nodeMatchesFilterIds(node: GraphNode, selectedFilterIds: string[]): boolean {
  for (const id of selectedFilterIds) {
    if (id === 'models' && node.type === 'model') return true;
    if (id === 'agents' && node.type === 'agent') return true;
    if (id === 'servers' && (node.type === 'mcp-server' || node.type === 'mcp-client')) return true;
    if (id === 'tools' && (node.type === 'tool' || node.type === 'mcp-resource')) return true;
    if (id === 'libraries' && node.type === 'library') return true;
    if (id === 'services' && node.type === 'service') return true;
  }
  return false;
}

export const ConstellationGraph = forwardRef<ConstellationGraphHandle, {
  graphData: GraphData;
  onNodeSelect: (node: GraphNode | null) => void;
  selectedNodeId: string | null;
  selectedFilterIds: string[];
  searchQuery?: string;
}>(function ConstellationGraph({
  graphData,
  onNodeSelect,
  selectedNodeId,
  selectedFilterIds,
  searchQuery = ''
}, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Filter nodes by type (multi-select filter) and by search (fuzzy match on type + name)
  const filteredNodes = useMemo(() => {
    let nodes = graphData.nodes;
    if (selectedFilterIds.length > 0) {
      nodes = nodes.filter(node => nodeMatchesFilterIds(node, selectedFilterIds));
    }
    if (searchQuery.trim()) {
      nodes = nodes.filter(node => {
        const typeLabel = nodeTypeConfig[node.type]?.label ?? node.type;
        return fuzzyMatchAny(searchQuery, [node.label, node.fullName, node.type, typeLabel]);
      });
    }
    return nodes;
  }, [graphData.nodes, selectedFilterIds, searchQuery]);

  // Calculate node positions in a radial constellation layout
  const nodePositions = useMemo(() => {
    const positions: NodePosition[] = [];
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    // Group nodes by type
    const nodesByType: Record<string, GraphNode[]> = {};
    filteredNodes.forEach(node => {
      if (!nodesByType[node.type]) nodesByType[node.type] = [];
      nodesByType[node.type].push(node);
    });

    // Position root/application at center
    const rootNode = filteredNodes.find(n => n.type === 'application' && n.id.includes('Root'));
    if (rootNode) {
      positions.push({
        x: centerX,
        y: centerY,
        node: rootNode,
        scale: 1.5,
        angle: 0,
        radius: 0,
      });
    }

    // Position other nodes in orbital rings. Each type has a canonical ring index
    // (from constellationRingOrder) so that filtering to one type keeps nodes on the same circle.
    const typeToRingIndex: Record<string, number> = {};
    constellationRingOrder.forEach((type, idx) => { typeToRingIndex[type] = idx + 1; });
    // Application (non-root) uses the ring after the last constellation ring
    const applicationRingIndex = constellationRingOrder.length + 1;

    constellationRingOrder.forEach(type => {
      const nodes = nodesByType[type]?.filter(n => n !== rootNode);
      if (!nodes?.length) return;

      const ringIndex = typeToRingIndex[type];
      const ringRadius = 80 + ringIndex * 90;
      const angleStep = (2 * Math.PI) / Math.max(nodes.length, 6);
      const startAngle = (ringIndex * Math.PI) / 7;

      nodes.forEach((node, i) => {
        const angle = startAngle + i * angleStep;
        positions.push({
          x: centerX + Math.cos(angle) * ringRadius,
          y: centerY + Math.sin(angle) * ringRadius,
          node,
          scale: 1,
          angle,
          radius: ringRadius,
        });
      });
    });

    // Add any application nodes that aren't root (canonical ring after typeOrder types)
    const otherApps = nodesByType['application']?.filter(n => n !== rootNode);
    if (otherApps?.length) {
      const ringIndex = applicationRingIndex;
      const ringRadius = 80 + ringIndex * 90;
      const angleStep = (2 * Math.PI) / Math.max(otherApps.length, 6);
      const startAngle = (ringIndex * Math.PI) / 7;

      otherApps.forEach((node, i) => {
        const angle = startAngle + i * angleStep;
        positions.push({
          x: centerX + Math.cos(angle) * ringRadius,
          y: centerY + Math.sin(angle) * ringRadius,
          node,
          scale: 1,
          angle,
          radius: ringRadius,
        });
      });
    }

    return positions;
  }, [filteredNodes, dimensions]);

  // Filter edges to only include nodes that are visible
  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id));
    return graphData.edges.filter(
      edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)
    );
  }, [graphData.edges, filteredNodes]);

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw function
  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas with dark background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Add subtle gradient overlay (purple to orange ambient)
    const ambientGradient = ctx.createRadialGradient(
      dimensions.width * 0.2, dimensions.height * 0.3, 0,
      dimensions.width * 0.5, dimensions.height * 0.5, dimensions.width * 0.8
    );
    ambientGradient.addColorStop(0, 'rgba(192, 38, 211, 0.03)');
    ambientGradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.02)');
    ambientGradient.addColorStop(1, 'rgba(249, 115, 22, 0.01)');
    ctx.fillStyle = ambientGradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(dimensions.width / 2, dimensions.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-dimensions.width / 2 + pan.x, -dimensions.height / 2 + pan.y);

    // Draw subtle grid (large enough to cover all orbital rings)
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRingRadius = 80 + 8 * 90;
    const gridExtent = maxRingRadius + 160;
    const gridMinX = centerX - gridExtent;
    const gridMaxX = centerX + gridExtent;
    const gridMinY = centerY - gridExtent;
    const gridMaxY = centerY + gridExtent;
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let x = gridMinX; x <= gridMaxX; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, gridMinY);
      ctx.lineTo(x, gridMaxY);
      ctx.stroke();
    }
    for (let y = gridMinY; y <= gridMaxY; y += 40) {
      ctx.beginPath();
      ctx.moveTo(gridMinX, y);
      ctx.lineTo(gridMaxX, y);
      ctx.stroke();
    }

    // Draw orbital rings (opacity tuned so rings are visible but not dominant)
    for (let i = 1; i <= 8; i++) {
      const radius = 80 + i * 90;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.06, 0.18 - i * 0.015)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Create position lookup
    const positionLookup: Record<string, NodePosition> = {};
    nodePositions.forEach(p => {
      positionLookup[p.node.id] = p;
    });

    // Draw edges with animated glow
    filteredEdges.forEach(edge => {
      const fromPos = positionLookup[edge.from];
      const toPos = positionLookup[edge.to];
      if (!fromPos || !toPos) return;

      const isHighlighted = 
        hoveredNode === edge.from || 
        hoveredNode === edge.to ||
        selectedNodeId === edge.from ||
        selectedNodeId === edge.to;

      // Animated pulse effect
      const pulsePhase = (time * 0.001 + fromPos.angle) % 1;
      
      // Create gradient for edge
      const gradient = ctx.createLinearGradient(fromPos.x, fromPos.y, toPos.x, toPos.y);
      const fromConfig = nodeTypeConfig[fromPos.node.type];
      const toConfig = nodeTypeConfig[toPos.node.type];
      
      if (isHighlighted) {
        gradient.addColorStop(0, fromConfig.color + 'cc');
        gradient.addColorStop(pulsePhase, fromConfig.color + 'ff');
        gradient.addColorStop(1, toConfig.color + 'cc');
      } else {
        gradient.addColorStop(0, fromConfig.color + '33');
        gradient.addColorStop(1, toConfig.color + '33');
      }

      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      
      // Curved lines for more organic feel
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      const dx = toPos.x - fromPos.x;
      const dy = toPos.y - fromPos.y;
      const nx = -dy * 0.1;
      const ny = dx * 0.1;
      
      ctx.quadraticCurveTo(midX + nx, midY + ny, toPos.x, toPos.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = isHighlighted ? 2 : 1;
      ctx.stroke();

      // Draw animated particle on highlighted edges
      if (isHighlighted) {
        const t = pulsePhase;
        const px = fromPos.x + (toPos.x - fromPos.x) * t;
        const py = fromPos.y + (toPos.y - fromPos.y) * t;
        
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = fromConfig.color;
        ctx.fill();
      }
    });

    // Draw nodes
    nodePositions.forEach(pos => {
      const config = nodeTypeConfig[pos.node.type];
      const isHovered = hoveredNode === pos.node.id;
      const isSelected = selectedNodeId === pos.node.id;
      const isRoot = pos.node.type === 'application' && pos.node.id.includes('Root');
      const scale = pos.scale * (isHovered || isSelected ? 1.2 : 1);
      const baseSize = isRoot ? 28 : 20;
      const size = baseSize * scale;

      // Glow effect
      if (isHovered || isSelected) {
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 2);
        glow.addColorStop(0, config.color + '40');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Outer ring with subtle animation
      const breathe = 1 + Math.sin(time * 0.002 + pos.angle) * 0.05;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * breathe, 0, Math.PI * 2);
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = isHovered || isSelected ? 2 : 1;
      ctx.stroke();

      // Node background
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size - 4, 0, Math.PI * 2);
      ctx.fillStyle = config.bgColor;
      ctx.fill();

      // Inner glow
      const innerGlow = ctx.createRadialGradient(
        pos.x - size * 0.2, 
        pos.y - size * 0.2, 
        0, 
        pos.x, 
        pos.y, 
        size
      );
      innerGlow.addColorStop(0, config.color + '30');
      innerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size - 4, 0, Math.PI * 2);
      ctx.fill();

      // Icon/symbol in center
      ctx.fillStyle = config.color;
      ctx.font = `${size * 0.6}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, pos.x, pos.y);

      // Label
      ctx.fillStyle = isHovered || isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)';
      ctx.font = `19px sans-serif`;
      ctx.textAlign = 'center';
      const displayLabel = pos.node.label.length > 18 ? pos.node.label.slice(0, 16) + '...' : pos.node.label;
      ctx.fillText(displayLabel, pos.x, pos.y + size + 16);
    });

    ctx.restore();
  }, [dimensions, nodePositions, filteredEdges, hoveredNode, selectedNodeId, zoom, pan]);

  // Animation loop
  useEffect(() => {
    const animate = (time: number) => {
      timeRef.current = time;
      draw(time);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [draw]);

  // Handle mouse interactions
  const getNodeAtPosition = useCallback((clientX: number, clientY: number): NodePosition | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - dimensions.width / 2) / zoom + dimensions.width / 2 - pan.x;
    const y = (clientY - rect.top - dimensions.height / 2) / zoom + dimensions.height / 2 - pan.y;

    for (const pos of nodePositions) {
      const isRoot = pos.node.type === 'application' && pos.node.id.includes('Root');
      const size = isRoot ? 28 : 20;
      const dx = pos.x - x;
      const dy = pos.y - y;
      if (dx * dx + dy * dy < size * size) {
        return pos;
      }
    }
    return null;
  }, [nodePositions, dimensions, zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setPan(p => ({ x: p.x + dx / zoom, y: p.y + dy / zoom }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const nodePos = getNodeAtPosition(e.clientX, e.clientY);
    setHoveredNode(nodePos?.node.id || null);
    
    if (canvasRef.current) {
      canvasRef.current.style.cursor = nodePos ? 'pointer' : 'grab';
    }
  }, [getNodeAtPosition, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const nodePos = getNodeAtPosition(e.clientX, e.clientY);
    if (!nodePos) {
      isDragging.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grabbing';
      }
    }
  }, [getNodeAtPosition]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredNode ? 'pointer' : 'grab';
    }
  }, [hoveredNode]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging.current) return;
    const nodePos = getNodeAtPosition(e.clientX, e.clientY);
    onNodeSelect(nodePos?.node || null);
  }, [getNodeAtPosition, onNodeSelect]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.3), 3));
  }, []);

  // Zoom with + / - keys (Google Maps style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [contenteditable="true"]')) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(z => Math.min(z * 1.2, 3));
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(z => Math.max(z * 0.8, 0.3));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Expose zoomToFit to parent (e.g. header button)
  useImperativeHandle(ref, () => ({
    zoomToFit() {
      if (nodePositions.length === 0) return;
      const padding = 80;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodePositions.forEach(pos => {
        const isRoot = pos.node.type === 'application' && pos.node.id.includes('Root');
        const r = isRoot ? 28 : 20;
        minX = Math.min(minX, pos.x - r);
        minY = Math.min(minY, pos.y - r);
        maxX = Math.max(maxX, pos.x + r);
        maxY = Math.max(maxY, pos.y + r);
      });
      const w = maxX - minX + 2 * padding;
      const h = maxY - minY + 2 * padding;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const zoomX = dimensions.width / w;
      const zoomY = dimensions.height / h;
      const newZoom = Math.min(Math.max(Math.min(zoomX, zoomY), 0.3), 3);
      setPan({
        x: dimensions.width / 2 - centerX,
        y: dimensions.height / 2 - centerY,
      });
      setZoom(newZoom);
    },
  }), [nodePositions, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.2, 3))}
          className="w-8 h-8 bg-secondary/80 backdrop-blur-sm rounded-md flex items-center justify-center text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
        >
          +
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z * 0.8, 0.3))}
          className="w-8 h-8 bg-secondary/80 backdrop-blur-sm rounded-md flex items-center justify-center text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
        >
          −
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="px-3 h-8 bg-secondary/80 backdrop-blur-sm rounded-md flex items-center justify-center text-xs text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
});
