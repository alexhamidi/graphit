export interface Edge {
  id: string;
  value: string;
  n1: string;
  n2: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  value: string;
  pos: Position;
  customColor: string;
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

export interface LocatedEdge {
  id: string;
  value: string;
  n1: string;
  n2: string;
  pos: Position;
}

export interface Graph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
}

export interface Credentials {
  email: string;
  password: string;
}

export interface PageProps {
  setAuthenticated: (auth: boolean) => void;
  authenticated: boolean;
}

export interface GraphConfig {
  edgeMode: boolean;
  directedMode: boolean;
  circleRadius: number;
  fontSize: number;
  lineWeight: number;
  currentChosenColor: string | null;
}
