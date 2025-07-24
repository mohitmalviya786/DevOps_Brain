import { create } from 'zustand';
import { DiagramData, InfrastructureNode, InfrastructureEdge } from '@/types/infrastructure';

interface InfrastructureStore {
  currentDiagram: DiagramData;
  selectedNode: InfrastructureNode | null;
  isGeneratingCode: boolean;
  generatedCode: string | null;
  costEstimation: any | null;
  
  // Actions
  setNodes: (nodes: InfrastructureNode[]) => void;
  setEdges: (edges: InfrastructureEdge[]) => void;
  addNode: (node: InfrastructureNode) => void;
  updateNode: (nodeId: string, updates: Partial<InfrastructureNode>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: InfrastructureEdge) => void;
  removeEdge: (edgeId: string) => void;
  selectNode: (node: InfrastructureNode | null) => void;
  setGeneratingCode: (generating: boolean) => void;
  setGeneratedCode: (code: string | null) => void;
  setCostEstimation: (estimation: any) => void;
  clearDiagram: () => void;
  loadDiagram: (diagram: DiagramData) => void;
}

export const useInfrastructureStore = create<InfrastructureStore>((set, get) => ({
  currentDiagram: {
    nodes: [],
    edges: [],
  },
  selectedNode: null,
  isGeneratingCode: false,
  generatedCode: null,
  costEstimation: null,

  setNodes: (nodes) =>
    set((state) => ({
      currentDiagram: { ...state.currentDiagram, nodes },
    })),

  setEdges: (edges) =>
    set((state) => ({
      currentDiagram: { ...state.currentDiagram, edges },
    })),

  addNode: (node) =>
    set((state) => ({
      currentDiagram: {
        ...state.currentDiagram,
        nodes: [...state.currentDiagram.nodes, node],
      },
    })),

  updateNode: (nodeId, updates) =>
    set((state) => ({
      currentDiagram: {
        ...state.currentDiagram,
        nodes: state.currentDiagram.nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node
        ),
      },
      selectedNode: state.selectedNode?.id === nodeId 
        ? { ...state.selectedNode, ...updates } 
        : state.selectedNode,
    })),

  removeNode: (nodeId) =>
    set((state) => ({
      currentDiagram: {
        nodes: state.currentDiagram.nodes.filter((node) => node.id !== nodeId),
        edges: state.currentDiagram.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      },
      selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
    })),

  addEdge: (edge) =>
    set((state) => ({
      currentDiagram: {
        ...state.currentDiagram,
        edges: [...state.currentDiagram.edges, edge],
      },
    })),

  removeEdge: (edgeId) =>
    set((state) => ({
      currentDiagram: {
        ...state.currentDiagram,
        edges: state.currentDiagram.edges.filter((edge) => edge.id !== edgeId),
      },
    })),

  selectNode: (node) => set({ selectedNode: node }),

  setGeneratingCode: (generating) => set({ isGeneratingCode: generating }),

  setGeneratedCode: (code) => set({ generatedCode: code }),

  setCostEstimation: (estimation) => set({ costEstimation: estimation }),

  clearDiagram: () =>
    set({
      currentDiagram: { nodes: [], edges: [] },
      selectedNode: null,
      generatedCode: null,
      costEstimation: null,
    }),

  loadDiagram: (diagram) =>
    set({
      currentDiagram: diagram,
      selectedNode: null,
    }),
}));
