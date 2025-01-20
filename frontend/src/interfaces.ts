import { v4 as uuidv4 } from "uuid";

export interface Graph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

export class Graph {
  constructor(name: string) {
    this.id = uuidv4();
    this.name = name;
    this.nodes = [];
    this.edges = [];
  }
}

export interface Edge {
  id: string;
  value: string;
  n1: string;
  n2: string;
}

export class Edge {
  constructor(n1: string, n2: string, edgeValue?: string) {
    this.id = uuidv4();
    this.value = edgeValue ?? "0";
    this.n1 = n1;
    this.n2 = n2;
  }
}

export interface Node {
  id: string;
  value: string;
  pos: Position;
  customColor: string;
}

export class Node {
  constructor(
    canvasRect: DOMRect | null,
    currentChosenColor: string | null,
    cursorPos?: Position,
    newValue?: string,
  ) {
    this.id = uuidv4();
    this.value = newValue ?? "0";
    this.pos = cursorPos ?? {
      x: Math.random() * (canvasRect?.width ?? 0),
      y: Math.random() * (canvasRect?.height ?? 0),
    };
    this.customColor = currentChosenColor ?? "";
  }
}
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface TempEdge {
  n1: string;
  p1: Position;
  p2: Position;
}

export interface AdjEdge {
  n2: string;
  value: string;
}

export interface LocatedEdge {
  id: string;
  value: string;
  n1: string;
  n2: string;
  pos: Position;
  width: number;
  height:number;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface PageProps {
  setAuthenticated: (auth: boolean) => void;
  authenticated: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export interface GraphConfig {
  edgeMode: boolean;
  directedMode: boolean;
  gravityMode: boolean;
  unboundedMode: boolean;
  circleRadius: number;
  fontSize: number;
  lineWeight: number;
  currentChosenColor: string | null;
}

export interface BoxActive {
  aiBox: boolean;
  newBlankGraphBox: boolean;
  newTextGraphBox: boolean;
  infoBox: boolean;
  queryBox: boolean;
}

export interface Colors {
  line: string;
  main: string;
  text: string;
}

export interface SelectingAlgo {
  dfs: boolean;
  bfs: boolean;
  shortest: boolean;
}

export type MiniEdge = [string, string, string?];

//groupings

// Graph Actions
export interface GraphActions {
  handleReplaceCurrGraph: (graph: Graph) => void;
  handleNewGraphFromInput: (
    name: string,
    nodeValues: string[],
    edgeValues: MiniEdge[],
  ) => void;
  handleNewGraph: (name: string) => void;
  handleAddGraph: (graph: Graph) => void;
  setAndCacheCurrGraph: (id: string) => void;
  handleDeleteGraph: () => void;
}

// Node Actions
export interface NodeActions {

  handleAddNode: (cursorPos: Position, newValue?: string) => void;
  handleDeleteNode: (id: string) => void;
  handleBasicNodeClick: (id: string) => void;
  handleUpdateNodePos: (id: string, pos: Position) => void;
  handleEditNode: (editNode: Node, newValue: string) => void;
  handleMassPosUpdate: (ids: Set<string>, delta: Position) => void;

}

// Edge Actions
export interface EdgeActions {
  handleAddEdge: (n1: string, n2: string) => void;
  handleDeleteEdge: (id: string) => void;
  handleEditEdge: (editEdge: Edge, newValue: string) => void;
}

// Algorithm Actions (AlgoActions)
export interface AlgoActions {
  handleStartAlgo: (type: string, currGraph: string) => void;
  handleSearchValueSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleGetTraversal: (type: string) => Promise<void>;
  handleGetShortest: () => Promise<void>;
  displayAnimation: (ids: string[]) => Promise<void>;
  handleEndAlgorithm: () => void;
}

// Miscellaneous Actions (MiscActions)
export interface MiscActions {
  handleCancelAllActive: () => void;
  handleCancelEditing: () => void;
  setErrorMessage: (message?: string) => void;
  isBoxActive: () => boolean;
}

// Authentication Actions (AuthActions)
export interface AuthActions {
  checkAuth: () => Promise<void>;
  handleLogout: () => void;
  handleLogin: () => void;
}

// Mouse Event Actions
export interface MouseEventActions {
  handleMouseDown: (e: MouseEvent) => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: (e: MouseEvent) => void;
}

export interface SaveActions {
  handleSaveGraphPNG: () => void;
  handleSaveGraphCPP: () => void;
}

// canvas

// Node Click Actions Interface
export interface NodeClickActions {
  handleRightClickNode: (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    node: Node,
  ) => void;
  handleMouseDownNode: (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    node: Node,
  ) => void;
}

export interface EdgeClickActions {
  handleMouseDownEdge: (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    edge: LocatedEdge,
  ) => void;
  handleRightClickEdge: (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    edge: Edge,
  ) => void;
}

export interface ZoomActions {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handlePanLeft: () => void;
  handlePanDown: () => void;
  handlePanUp: () => void;
  handlePanRight: () => void;
}



export interface Viewport{
  scale: number;
  translateX: number;
  translateY: number;
}
