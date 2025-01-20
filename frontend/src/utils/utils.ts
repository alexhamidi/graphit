import { Position, Node, Graph, AdjEdge } from "../interfaces";
import { PERP_LEN, EDGE_BOUNDARY } from "../constants";
import { authorizedFetch } from "../networking";
// App
export function outOfBounds(
  pos: Position,
  canvasDims: DOMRect | null,
): boolean {
  return (
    pos.x < 10 ||
    pos.x > canvasDims!.width ||
    pos.y < 10 ||
    pos.y > canvasDims!.height
  );
}

export function getPosRelRect(
  pos: Position,
  canvasDims: DOMRect | null,
): Position {
  return { x: pos.x - canvasDims!.left, y: pos.y - canvasDims!.top };
}

// Canvas
export function getPosRelParent(
  e: React.MouseEvent<SVGGElement, MouseEvent>,
): Position {
  const dim = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX - dim.left, y: e.clientY - dim.top };
}

export function getNodeAt(
  pos: Position,
  nodes: Node[],
  circleRadius: number,
): Node | null {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    const dx: number = pos.x - node.pos.x;
    const dy: number = pos.y - node.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < circleRadius) {
      return node;
    }
  }
  return null;
}

// const screenToSVGCoordinates = (
//   pos: Position,
//   canvasRect: DOMRect | null,
//   canvasRef: React.RefObject<SVGSVGElement>
// ) => {
//   if (!canvasRef.current || !canvasRect) return { x: 0, y: 0 };

//   const ctm = canvasRef.current.getScreenCTM();
//   if (!ctm) return { x: 0, y: 0 };

//   // Adjust for viewport scaling

//   const point = canvasRef.current.createSVGPoint();
//   point.x = pos.x;
//   point.y = pos.y;

//   const svgPoint = point.matrixTransform(ctm.inverse());

//   return {
//     x: svgPoint.x,
//     y: svgPoint.y
//   };
// };


export function getBoundedPosition(
  pos: Position,
  canvasRect: DOMRect | null,
): Position {
  return {
    x: Math.min(
      Math.max(pos.x, EDGE_BOUNDARY),
      canvasRect!.width - EDGE_BOUNDARY,
    ),
    y: Math.min(
      Math.max(pos.y, EDGE_BOUNDARY),
      canvasRect!.height - EDGE_BOUNDARY,
    ),
  };
}

export function getUpdatedPosition(
  pos: Position,
  canvasRect: DOMRect | null,
  unbounded: boolean,
  canvasRef: React.RefObject<SVGSVGElement>
): Position {
  if (unbounded) {
    return pos
    // return screenToSVGCoordinates(pos, canvasRect, canvasRef);
  }
  return (getBoundedPosition(pos, canvasRect))
}

export function getDistance(pos1: Position, pos2: Position): number {
  const distance = Math.sqrt(
    (pos1.x - pos2.x) * (pos1.x - pos2.x) +
      (pos1.y - pos2.y) * (pos1.y - pos2.y),
  );
  return distance;
}

export function getMidpoint(coord1: number, coord2: number): number {
  const distance = Math.min(coord1, coord2) + Math.abs(coord1 - coord2) / 2;
  return distance;
}

export async function fetchEmail(token: string): Promise<string | null> {
  try {
    const response = await authorizedFetch("/validate", token);
    return response.data.email;
  } catch (err) {
    return null;
  }
}

export function addPos(pos: Position, other: Position): Position {
  return { x: pos.x + other.x, y: pos.y + other.y };
}

export function subtractPos(pos: Position, other: Position): Position {
  return { x: pos.x - other.x, y: pos.y - other.y };
}

export function multiplyPos(pos: Position, num: number): Position {
  return { x: pos.x * num, y: pos.y * num };
}

export function dividePos(pos: Position, num: number): Position {
  return { x: pos.x / num, y: pos.y / num };
}

export function lengthPos(pos: Position): number {
  return Math.sqrt(pos.x * pos.x + pos.y * pos.y);
}

export function getAdj(graph: Graph): Map<string, AdjEdge[]> {
  //maps ?
  let adj: Map<string, AdjEdge[]> = new Map<string, AdjEdge[]>();
  graph.edges.forEach((edge) => {
    if (!adj.has(edge.n1)) {
      adj.set(edge.n1, []);
    }
    adj.get(edge.n1)!.push({ n2: edge.n2, value: edge.value });
  });
  return adj;
}


export function getNodeMap(nodes: Node[]) : Map<string,Node>  {
  return new  Map<string,Node>()
}

// export function minPos(pos: Position, num: number): Position {
//   return { x: Math.min(pos.x, num), y: Math.min(pos.y, num) };
// }

export function adjustEndpoint(
  p1: Position,
  p2: Position,
  circleRadius: number,
): Position {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the point that's `radius` units before the end point
  const t = (distance - circleRadius) / distance;

  return {
    x: p1.x + dx * t,
    y: p1.y + dy * t,
  };
}

export function getBidirectionalOffsets(p1: Position, p2: Position): Position {
  const yNeg: boolean = p2.y - p1.y < 0;
  let dx, dy;
  if (Math.abs(p1.y - p2.y) < 0.00001) {
    dx = 0;
    dy = p2.x > p1.x ? PERP_LEN : -PERP_LEN;
  } else {
    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    const p_slope = -(1 / (slope + 0.0000001));
    dx = -Math.sqrt((PERP_LEN * PERP_LEN) / (1 + p_slope * p_slope));
    dy = p_slope * dx;
  }
  if (yNeg) {
    dx *= -1;
    dy *= -1;
  }
  return {
    x: dx,
    y: dy,
  };
}

export function getConnected(edgeID: string, graph: Graph): Set<string> {
  const connected = new Set<string>();

  // Find the initial edge to start the traversal
  const edge = graph.edges.find(e => e.id === edgeID);
  if (!edge) return connected; // Return an empty set if the edge is not found

  // Use a DFS to find all connected edges and nodes
  const visitedEdges = new Set<string>();
  const stack = [edge];

  while (stack.length > 0) {
    const currentEdge = stack.pop()!;

    if (visitedEdges.has(currentEdge.id)) {
      continue;
    }

    // Mark this edge as visited
    visitedEdges.add(currentEdge.id);
    connected.add(currentEdge.id);

    // Add the nodes to the connected set
    connected.add(currentEdge.n1);
    connected.add(currentEdge.n2);

    // Explore adjacent edges that connect to the current nodes
    const adjacentEdges = graph.edges.filter(e =>
      (e.n1 === currentEdge.n1 || e.n2 === currentEdge.n1) ||
      (e.n1 === currentEdge.n2 || e.n2 === currentEdge.n2)
    );

    // Add unvisited adjacent edges to the stack
    for (const adjEdge of adjacentEdges) {
      if (!visitedEdges.has(adjEdge.id)) {
        stack.push(adjEdge);
      }
    }
  }

  return connected;
}
