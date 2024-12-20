import { useState, useEffect } from 'react'
import Canvas from './Components/Canvas'
import { outOfBounds, getPosRelCanvas } from './utils'
import { Edge, Position, Node } from './interfaces'
import { canvasSize } from './constants'

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [seenEdges, setSeenEdges] = useState<number>(0);
  const [seenNodes, setSeenNodes] = useState<number>(0);
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [downPos, setDownPos] = useState<Position | null>(null);



  // Add edge
  const handleAddEdge = (n1: string, n2: string) => {
    const currID = seenEdges;
    const newEdge : Edge = {
      id: `${currID}`,
      value:'5',
      n1: n1,
      n2: n2
    }

    const updatedNodes = nodes.map(node => {
      if (node.id === n1 || node.id === n2) {
          return { ...node, edges: [...node.edges, `${currID}`] };
      } else {
          return node;
      }
    });
    setNodes(updatedNodes);
    setEdges(prevEdges => [...prevEdges, newEdge]);
    setSeenEdges(seenEdges => seenEdges+1);
  }



  // Add Node
  const handleAddNode = (cursorPos: Position | null) => {
    setNodes(prevNodes => [
      ...prevNodes,
      {
        id: `${seenNodes}`,
        value: `${seenNodes}`,
        pos: cursorPos ? cursorPos : {
          x: Math.random() * canvasSize.width,
          y: Math.random() * canvasSize.height,
        },
        edges:[]
      }
    ]);
    setSeenNodes(seenNodes => seenNodes+1);
  }



  // Update node position
  const handleUpdateNodePos = (id: string, pos: Position) => {
    const updatedNodes = nodes.map(node =>
      node.id === id
        ? { ...node, pos: pos }
        : node
    );
    setNodes(updatedNodes);
  }


  // Delete node
  const handleDeleteNode = (id: string) => {
    setNodes(nodes => nodes.filter(node => node.id !== id));
  }



  // Key Handling - updating shift
  const handleKeyDown = (e : KeyboardEvent) => {
    if (e.key === 'Shift') {
      setShiftPressed(true);
    }
  }

  const handleKeyUp = () => {
    setShiftPressed(false);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [seenNodes]);



  // Mouse Handling - adding nodes
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      setDownPos({ x: e.clientX, y: e.clientY })
    }
  };


  const handleMouseUp = (e:MouseEvent) => {
    if (downPos && downPos.x === e.clientX && downPos.y === e.clientY) {
      const posRelCanvas : Position = getPosRelCanvas({ x: e.clientX, y: e.clientY });
      if (!outOfBounds(posRelCanvas)) {
        handleAddNode({x:posRelCanvas.x+5, y:posRelCanvas.y+9});
      }
    }
    setDownPos(null);
  }


  useEffect(() => {
    console.log('hi');
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [downPos]);



  // Returned component
  return (
    <>
      <header id='mainHead'>
        hello, and welcome to the best graph editor
      </header>
      <main>
        <Canvas
          nodes={nodes}
          edges={edges}
          handleAddEdge={handleAddEdge}
          handleDeleteNode={handleDeleteNode}
          handleUpdateNodePos={handleUpdateNodePos}
          shiftPressed={shiftPressed}/>
      </main>
    </>
  )
}
