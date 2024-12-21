import { Position, Node } from './interfaces'
import { circleRadius } from './constants'

// App
export function outOfBounds(pos : Position, canvasDims : DOMRect | null) : boolean {
  return (pos.x < 10 || pos.x > canvasDims!.width || pos.y < 10 || pos.y > canvasDims!.height);
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

export function getDistance(pos1 : Position, pos2 : Position) : number {
  const distance = Math.sqrt((pos1.x-pos2.x) * (pos1.x-pos2.x) + (pos1.y-pos2.y) * (pos1.y-pos2.y));
  return distance;
}

export function getArrowPos(node1 : Node, node2 : Node) : Position { // how tf is it all nan
  const nodeDistance : number = getDistance(node1.pos, node2.pos);
  const arrowDistance : number = nodeDistance-circleRadius*1.3;


  // console.log(arrowDistance);
  // console.log(nodeDistance);

  const scale : number = arrowDistance / nodeDistance;

  // console.log(scale);

  const newRelX : number = scale * (node2.pos.x - node1.pos.x);
  const newRelY : number = scale * (node2.pos.y - node1.pos.y);

  // console.log(newRelX, newRelY)

  const newXPos : number = node1.pos.x + newRelX;
  const newYPos : number = node1.pos.y + newRelY;

  const newPos : Position = {x:newXPos,y:newYPos};
  // console.log(newPos);df
  return newPos;
}

