import { useState, useEffect, useRef } from 'react'
import { getPosRelParent, getNodeAt, outOfBounds } from '../utils'
import { Node, Position, Edge, TempEdge } from '../interfaces'
import { circleRadius } from '../constants'

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  handleAddEdge: (n1: string, n2: string) => void;
  handleDeleteNode: (id: string) => void;
  handleUpdateNodePos: (id: string, pos: Position) => void;
  shiftPressed: boolean;
  setCanvasRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  canvasRect: DOMRect | null;
}


export default function Canvas({ nodes, edges, handleAddEdge, handleDeleteNode, handleUpdateNodePos, shiftPressed, setCanvasRect, canvasRect }: CanvasProps) {
  const [dragPos, setDragPos] = useState<{x:number, y:number} | null>(null);
  const [dragging, setDragging] = useState<Node | null>(null);
  const [edging, setEdging] = useState<TempEdge | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const canvasRef = useRef<SVGSVGElement | null>(null);

  // Mouse down - handle drag or edge depending on shift
  const handleMouseDownCircle = (e: React.MouseEvent<SVGGElement, MouseEvent>, node: Node) => {//problem - relative to nodes (not a problem)
    e.preventDefault();
    const startingMousePosRelCircle : Position = getPosRelParent(e);
    if (shiftPressed) {
      setSelectedNode(node);
      setEdging({
        n1: node.id,
        p1: node.pos,
        p2: node.pos,
      })
    } else {
      setDragging(node);
      setDragPos({x: startingMousePosRelCircle.x - (circleRadius * 2)/2.2, y: startingMousePosRelCircle.y - (circleRadius * 2)/2.2 });
    }
  }

  const handleMouseDownEdge = (e: React.MouseEvent<SVGElement, MouseEvent>, edge: Edge) => {
    e.preventDefault();
    if (shiftPressed) {
      setSelectedEdge(edge);
    }
  }



  // Mouse move - handle dragging or edging
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (dragging) {
      const cursorPos : Position = getPosRelParent(e);
      if (outOfBounds(cursorPos, canvasRect)) {
        handleMouseUp(e);
        return;
      }
      handleUpdateNodePos(dragging.id, { x: cursorPos.x - dragPos!.x, y: cursorPos.y - dragPos!.y });
    } else if (edging) {
      const cursorPos = getPosRelParent(e);
      setEdging({
        ...edging,
        p2: cursorPos,
      })
    }
    if (selectedEdge) setSelectedEdge(null);
    if (selectedNode) setSelectedNode(null);
  };



  // Mouse up - stop edging/dragging
  const handleMouseUp = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
     if (shiftPressed && selectedEdge) { // not exactly workin
      console.log('editing edge with value ', selectedEdge.value) //working
      setSelectedEdge(null);
      setEdging(null);
    } else if (shiftPressed && selectedNode) {
      console.log('editing node with value ', selectedNode.value)
      setSelectedNode(null);
      setEdging(null);
    } else if (dragging) {
      setDragging(null);
      setDragPos(null);
    } else if (edging) { //dont add nodee if equal because already at the same
      const cursorPos = getPosRelParent(e);
      const cursorNode : Node | null = getNodeAt(cursorPos, nodes)
      if (cursorNode) {
        handleAddEdge(edging.n1, cursorNode.id);
      }
      setEdging(null);
    }


    // if positions are equal, do none
  }



  // Right click - delete node
  const handleRightClick = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
    e.preventDefault();
    const cursorPos = getPosRelParent(e);
    const cursorNode : Node | null = getNodeAt(cursorPos, nodes)
    if (cursorNode) {
      handleDeleteNode(cursorNode.id);
    }
  }


  // Set initial boundary
  useEffect(() => {
    if (canvasRef.current) {
      const rect : DOMRect = canvasRef.current.getBoundingClientRect();
      setCanvasRect(rect);
    }
  }, [setCanvasRect])

  // Returned component
  return (
    <svg
      className="component"
      id="canvas"
      style={{ font: '1em monospace', userSelect: 'none' }}
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleRightClick}
    >
      {edges.map(edge => {
        const node1 = nodes.find((node) => node.id === edge.n1);
        const node2 = nodes.find((node) => node.id === edge.n2);

        if (!node1 || !node2) {
          return;
        }

        const labelPos : Position = {
          x: Math.min(node1.pos.x, node2.pos.x) + Math.abs(node1.pos.x - node2.pos.x)/2,
          y: Math.min(node1.pos.y, node2.pos.y) + Math.abs(node1.pos.y - node2.pos.y)/2
        }

        return <g
            key = {edge.id}
            onMouseDown={(e) => handleMouseDownEdge(e,edge)}
            >

            <line
              x1 = {node1.pos.x}
              y1 = {node1.pos.y}
              x2 = {node2.pos.x}
              y2 = {node2.pos.y}
              stroke="black"
              strokeWidth="2"
            ></line>
            <text
              x={labelPos.x}
              y={labelPos.y}
              dy="0.35em"
              textAnchor="middle"
              pointerEvents="none"
              stroke="white"
              strokeWidth={8}
              >
                O
            </text>
            <text
              x={labelPos.x}
              y={labelPos.y}
              dy="0.35em"
              textAnchor="middle"
              pointerEvents="none"
            >
             {edge.value}
            </text>
          </g>
      })}
      {edging && <line
        x1 = {edging.p1.x}
        y1 = {edging.p1.y}
        x2 = {edging.p2.x}
        y2 = {edging.p2.y}
        stroke="black"
        strokeWidth="2"
      ></line>}
      {nodes.map(node => (
        <g
          key={node.id}
          onMouseDown={(e) => handleMouseDownCircle(e, node)}
        >
          <circle
            cx={node.pos.x}
            cy={node.pos.y}
            r={circleRadius}
            fill="white"
            stroke="black"
            strokeWidth={2}
          />
          <text
            x={node.pos.x}
            y={node.pos.y}
            dy="0.35em"
            textAnchor="middle"
            pointerEvents="none"
          >
            {node.value}
          </text>
        </g>

      ))}
    </svg>
  )
}
