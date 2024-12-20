import { Position, Node } from './interfaces'
import { circleRadius, canvasSize, canvasBoundingRect } from './constants'

// App
export function outOfBounds(pos : Position) : boolean {
    return (pos.x < 10 || pos.x > canvasSize.width || pos.y < 10 || pos.y > canvasSize.height);
  }

export function getPosRelCanvas (pos : Position) : Position {
return {x:pos.x - canvasBoundingRect!.left, y:pos.y - canvasBoundingRect!.top}
}



// Canvas
export function getPosRelParent (e:  React.MouseEvent<SVGGElement, MouseEvent>) : Position {
    const dim = e.currentTarget.getBoundingClientRect();
    return {x:e.clientX - dim.left, y:e.clientY - dim.top}
  }

 export  function getNodeAt(pos: Position, nodes: Node[]): Node | null {
    for (const node of nodes) {
      const dx : number = pos.x-node.pos.x;
      const dy : number = pos.y-node.pos.y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      if (distance < circleRadius) {
        return node;
      }
    }
    return null;
  }
