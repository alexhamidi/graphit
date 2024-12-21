import { Position, Node } from './interfaces'
import { circleRadius } from './constants'

// App
export function outOfBounds(pos : Position, canvasDims : DOMRect | null) : boolean {
  return (pos.x < 0 || pos.x > canvasDims!.width || pos.y < 0 || pos.y > canvasDims!.height);
}

export function getPosRelRect (pos : Position, canvasDims : DOMRect | null) : Position {
  return {x:pos.x - canvasDims!.left, y:pos.y - canvasDims!.top}
}

export function isNode (obj: any) {
  return (obj as Node).edges !== undefined
}

// Canvas
export function getPosRelParent (e:  React.MouseEvent<SVGGElement, MouseEvent>) : Position {
  const dim = e.currentTarget.getBoundingClientRect();
  return {x:e.clientX - dim.left, y:e.clientY - dim.top}
}

export function getNodeAt(pos: Position, nodes: Node[]): Node | null { //want to get the last one
  for (let i = nodes.length-1; i >= 0; i--) {
    const node = nodes[i];
    const dx : number = pos.x-node.pos.x;
    const dy : number = pos.y-node.pos.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    if (distance < circleRadius) {
        return node;
    }
  }
  return null;
}
