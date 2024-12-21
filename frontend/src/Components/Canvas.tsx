import { useState, useEffect, useRef } from 'react'
import { getPosRelParent, getNodeAt, outOfBounds } from '../utils'
import { Node, Position, Edge, TempEdge, LocatedEdge } from '../interfaces'
import { circleRadius, textBoxAdjustment } from '../constants'

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  handleAddEdge: (n1: string, n2: string) => void;
  handleDeleteNode: (id: string) => void;
  handleUpdateNodePos: (id: string, pos: Position) => void;
  handleDeleteEdge: (id: string) => void;
  shiftPressed: boolean;
  setCanvasRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  canvasRect: DOMRect | null;
  handleEditObj: (obj : Node | LocatedEdge, newValue : string) => void;
  editingObj: LocatedEdge | Node | null;
  setEditingObj: React.Dispatch<React.SetStateAction<LocatedEdge | Node | null>>
}


export default function Canvas({ nodes, edges, handleAddEdge, handleDeleteNode, handleUpdateNodePos, handleDeleteEdge, shiftPressed, setCanvasRect, canvasRect, handleEditObj, editingObj, setEditingObj}: CanvasProps) {
  const [dragPos, setDragPos] = useState<{x:number, y:number} | null>(null);
  const [dragging, setDragging] = useState<Node | null>(null);
  const [edging, setEdging] = useState<TempEdge | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<LocatedEdge | null>(null)
  const canvasRef = useRef<SVGSVGElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mouse down - handle drag or edge depending on shift
  const handleMouseDownNode = (e: React.MouseEvent<SVGGElement, MouseEvent>, node: Node) => {//problem - relative to nodes (not a problem)
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

  const handleMouseDownEdge = (e: React.MouseEvent<SVGElement, MouseEvent>, edge: LocatedEdge) => {
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
      setEditingObj(selectedEdge);
      setSelectedEdge(null);
      setEdging(null);
    } else if (shiftPressed && selectedNode) {
      console.log('editing node with value ', selectedNode.value)
      setEditingObj(selectedNode);
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

  // Right click - delete edge
  const handleRightClickEdge = (e: React.MouseEvent<SVGGElement, MouseEvent>, edge: Edge) => {
    e.preventDefault();
    handleDeleteEdge(edge.id);
  }


  // Right click - delete node
  const handleRightClickNode = (e: React.MouseEvent<SVGGElement, MouseEvent>, node: Node) => {
    e.preventDefault();
    handleDeleteNode(node.id);
  }


  // Set initial boundary
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        const rect : DOMRect = canvasRef.current.getBoundingClientRect();
        setCanvasRect(rect);
      }
    }
    updateCanvasRect();
    window.addEventListener('resize', updateCanvasRect);
    return () => {
      window.removeEventListener('resize', updateCanvasRect);
    };
  }, [setCanvasRect])


  // Update input focus
  useEffect(() => {
    if (editingObj && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingObj]);

  // Returned component
  return (<>
    {editingObj && (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (inputRef.current) handleEditObj(editingObj, inputRef.current.value);
          setEditingObj(null);
        }}
      >
        <input
          style={{
            position: "absolute",
            width: `2em`,
            top: canvasRect!.top + editingObj.pos.y-textBoxAdjustment.height,
            left: canvasRect!.left + editingObj.pos.x-textBoxAdjustment.width,
            borderRadius:4,
          }}
          type="text"
          ref={inputRef}
        />
        <input type="submit" style={{ display: "none" }} />
      </form>
    )}
    <svg
      className="component"
      id="canvas"
      style={{ font: "1em monospace", userSelect: "none" }}
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {edges.map(edge => {
        const node1 = nodes.find((node) => node.id === edge.n1);
        const node2 = nodes.find((node) => node.id === edge.n2);

        if (!node1 || !node2) {
          return;
        }

        const xPos = Math.min(node1.pos.x, node2.pos.x) + Math.abs(node1.pos.x - node2.pos.x)/2;
        const yPos = Math.min(node1.pos.y, node2.pos.y) + Math.abs(node1.pos.y - node2.pos.y)/2;

        const labelPos : Position = {
          x: xPos,
          y: yPos
        }

        return <g
        key={edge.id}
        onMouseDown={(e) => handleMouseDownEdge(e, {...edge, pos: {x:xPos, y:yPos}})}
        onContextMenu={(e) => handleRightClickEdge(e, edge)}
      >
        {/* Invisible hitbox */}
        <line
          x1={node1.pos.x}
          y1={node1.pos.y}
          x2={node2.pos.x}
          y2={node2.pos.y}
          stroke="transparent"
          strokeWidth="15" // Large hitbox
        />
        {/* Visible line */}
        <line
          x1={node1.pos.x}
          y1={node1.pos.y}
          x2={node2.pos.x}
          y2={node2.pos.y}
          stroke="black"
          strokeWidth="2"
        />
        {/* Text */}
        <text
          x={labelPos.x}
          y={labelPos.y}
          dy="0.35em"
          textAnchor="middle"
          pointerEvents="none"
          stroke="white"
          strokeWidth="10"
        >
           {'I'.repeat(edge.value.length)}
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
          onMouseDown={(e) => handleMouseDownNode(e, node)}
          onContextMenu={(e) => handleRightClickNode(e,node)}
        >
          <circle
            cx={node.pos.x}
            cy={node.pos.y}
            r={circleRadius}
            fill="white"
            stroke="black"
            strokeWidth="2"
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
  </>)
}
