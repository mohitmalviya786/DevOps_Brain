import { useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Connection,
  NodeChange,
  EdgeChange,
  Background,
  Controls,
  MiniMap,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { useInfrastructureStore } from "@/stores/infrastructureStore";
import { AWS_RESOURCES, InfrastructureNode } from "@/types/infrastructure";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Custom node component for AWS resources
function AWSResourceNode({ data }: { data: any }) {
  const resource = AWS_RESOURCES.find(r => r.type === data.resourceType);
  
  return (
    <div className="bg-white border-2 border-slate-300 rounded-lg p-3 min-w-[80px] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center space-y-1">
        {resource && (
          <i className={cn(resource.icon, resource.color, "text-lg")}></i>
        )}
        <span className="text-xs text-slate-600 font-medium text-center">
          {data.label || resource?.label || 'Resource'}
        </span>
        {data.instanceType && (
          <span className="text-xs text-slate-400">
            {data.instanceType}
          </span>
        )}
      </div>
    </div>
  );
}

// Memoize nodeTypes to prevent unnecessary re-renders
const nodeTypes = {
  awsResource: AWSResourceNode,
};

interface DiagramCanvasProps {
  onNodeSelect: (node: InfrastructureNode | null) => void;
  onDiagramChange: (nodes: Node[], edges: Edge[]) => void;
}

export default function DiagramCanvas({ onNodeSelect, onDiagramChange }: DiagramCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const { currentDiagram, addNode, addEdge: addStoreEdge, selectNode } = useInfrastructureStore();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Sync with store
  useEffect(() => {
    const flowNodes = currentDiagram.nodes.map(node => ({
      ...node,
      type: 'awsResource',
      data: {
        ...node.data,
        resourceType: node.type,
      },
    }));
    
    const flowEdges = currentDiagram.edges.map(edge => ({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#64748b', strokeWidth: 2 },
    }));
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [currentDiagram, setNodes, setEdges]);

  // Don't auto-notify parent of changes to prevent excessive saving
  // Parent can access the current state when needed

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        id: `edge-${params.source}-${params.target}`,
        source: params.source!,
        target: params.target!,
        type: 'smoothstep',
      };
      
      setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds));
      addStoreEdge(newEdge);
    },
    [setEdges, addStoreEdge]
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      const infraNode = currentDiagram.nodes.find(n => n.id === node.id);
      onNodeSelect(infraNode || null);
      selectNode(infraNode || null);
    },
    [currentDiagram.nodes, onNodeSelect, selectNode]
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
    selectNode(null);
  }, [onNodeSelect, selectNode]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const resourceType = event.dataTransfer.getData('application/reactflow');
      if (!resourceType || !reactFlowWrapper.current) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const resource = AWS_RESOURCES.find(r => r.type === resourceType);
      if (!resource) return;

      const newNode: InfrastructureNode = {
        id: `${resourceType}-${Date.now()}`,
        type: resourceType,
        position,
        data: {
          label: resource.label,
          ...resource.defaultProps,
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
    },
    [onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  return (
    <div className="w-full h-full bg-slate-50 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            const resource = AWS_RESOURCES.find(r => r.type === node.data.resourceType);
            return resource ? '#3b82f6' : '#64748b';
          }}
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        
        <Panel position="top-left">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
                title="Select"
              >
                <i className="fas fa-mouse-pointer text-sm"></i>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
                title="Pan"
              >
                <i className="fas fa-hand-paper text-sm"></i>
              </Button>
              <div className="w-px h-6 bg-slate-200"></div>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 h-8 w-8"
                title="Fit to Screen"
                onClick={() => {
                  const { fitView } = useReactFlow();
                  fitView();
                }}
              >
                <i className="fas fa-expand-arrows-alt text-sm"></i>
              </Button>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
