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

export interface LocatedEdge {
  id: string;
  value: string;
  n1: string;
  n2: string;
  pos: Position;
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
  gravityMode: boolean;
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
}

export type MiniEdge = [string, string, string?];
