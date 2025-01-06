import { Position, Node } from "../interfaces";
import {} from "../constants";
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
    const response = await authorizedFetch("/api/validate", token);
    return response.data.email;
  } catch (err) {
    return null;
  }
}
