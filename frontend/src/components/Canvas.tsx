import { useState, useEffect, useRef } from "react";
import {
  Node,
  Position,
  Edge,
  TempEdge,
  LocatedEdge,
  Graph,
  GraphConfig,
  NodeActions,
  EdgeActions,
  BoxActive,
  // Viewport
} from "../interfaces";
import {
  GRAPH_COLORS,
  PIXELS_PER_FONT_SIZE_UNIT,
  NUM_MAX_PHYSICS_ITERS,
  REFRESH_RATE,
  // PAN_AMOUNT,
  // ZOOM_FACTOR
} from "../constants";
import { getPosRelParent, getNodeAt, outOfBounds, getConnected, subtractPos, multiplyPos } from "../utils/utils";

import { updateNodePositions } from "../utils/physics";
import EditBox from "../components/EditBox";
import {
  NodeComponent,
  SelfEdgeComponent,
  EdgeComponent,
} from "../components/CanvasParts";
// import ControlPanel from "../components/ControlPanel";

interface Props {
  graph: Graph | null;
  nodeActions: NodeActions;
  edgeActions: EdgeActions;
  shiftPressed: boolean;
  setCanvasRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  canvasRect: DOMRect | null;
  boxActive: BoxActive;
  editInputRef: React.RefObject<HTMLInputElement>;
  canvasRef: React.RefObject<SVGSVGElement>;
  setErrorMessage: (message: string) => void;
  editingEdge: LocatedEdge | null;
  setEditingEdge: React.Dispatch<React.SetStateAction<LocatedEdge | null>>;
  editingNode: Node | null;
  setEditingNode: React.Dispatch<React.SetStateAction<Node | null>>;
  graphConfig: GraphConfig;
  setGraphs: React.Dispatch<React.SetStateAction<Map<string, Graph>>>;
  highlighted: Set<string>;
  loading: boolean;
  darkMode: boolean;
  controlPanelRef: React.RefObject<HTMLDivElement>
  // viewport:Viewport,
  // setViewport:React.Dispatch<React.SetStateAction<Viewport>>;
}

export default function Canvas({
  graph,
  nodeActions,
  edgeActions,
  shiftPressed,
  setCanvasRect,
  canvasRect,
  boxActive,
  editInputRef,
  canvasRef,
  editingEdge,
  setEditingEdge,
  editingNode,
  setEditingNode,
  graphConfig,
  setGraphs,
  highlighted,
  loading,
  darkMode,
  controlPanelRef,
  // viewport,
  // setViewport
}: Props) {
  // =================================================================
  // ========================== State Variables ========================
  // =================================================================

  const [mouseDownPosRelNode, setMouseDownPosRelNode] = useState<Position | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  const [mouseDownPosRelEdge, setMouseDownPosRelEdge] = useState<Position | null>(null);
  const [segmentDragFirstPos, setSegmentDragFirstPos] = useState<Position | null>(null);
  const [draggingEdgeSegment, setDraggingEdgeSegment] = useState<Set<string> | null>(null);

  const [edging, setEdging] = useState<TempEdge | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<LocatedEdge | null>(null);
  const [movedCurrNode, setMovedCurrNode] = useState<boolean>(false);
  const [editingName, setEditingName] = useState<string>("");

  // Bidirectional
  const [bidirectional, setBidirectional] = useState<Set<string>>(new Set());



  // =================================================================
  // ======================== Mouse Handlers ==========================
  // =================================================================
  const nodeClickActions = {
    handleMouseDownNode: (
      e: React.MouseEvent<SVGGElement, MouseEvent>,
      node: Node,
    ): void => {
      if (Object.values(boxActive).includes(true)) return;
      e.preventDefault();
      const startingMousePosRelCircle: Position = getPosRelParent(e);

      if (shiftPressed) {
        setSelectedNode(node);
        setEdgingBool(true);
        setEdging({
          n1: node.id,
          p1: node.pos,
          p2: node.pos,
        });
      } else {
        setMovedCurrNode(false);
        setDraggingNode(node.id);
        const charWidth: number =
          graphConfig.fontSize * PIXELS_PER_FONT_SIZE_UNIT;
        const numChars: number = node.value.length;
        const totalWidth: number = charWidth * numChars;
        const halfWidth: number = totalWidth / 2;
        const halfOver: number = Math.max(
          0,
          halfWidth - graphConfig.circleRadius,
        );

        setMouseDownPosRelNode({
          x: startingMousePosRelCircle.x - graphConfig.circleRadius - halfOver,
          y: startingMousePosRelCircle.y - graphConfig.circleRadius,
        });
      }
    },

    handleRightClickNode: (
      e: React.MouseEvent<SVGGElement, MouseEvent>,
      node: Node,
    ): void => {
      if (Object.values(boxActive).includes(true)) return;
      e.preventDefault();
      nodeActions.handleDeleteNode(node.id);
    },
  };

  const edgeClickActions = {
    handleMouseDownEdge: (
      e: React.MouseEvent<SVGGElement, MouseEvent>,
      edge: LocatedEdge,
    ): void => {
      if (Object.values(boxActive).includes(true)) return;
      if (e.button !== 0) return;

      e.preventDefault();
      if (shiftPressed) {
        setSelectedEdge(edge);
        return;
      }

      setSegmentDragFirstPos(edge.pos);
      setDraggingEdgeSegment(getConnected(edge.id, graph!));

      if (edge.n1 === edge.n2) {
        setMouseDownPosRelEdge({x:0,y:0})
      } else {
        const factor = .5;
        const startingMousePosRelEdge: Position = getPosRelParent(e);
        const scaledRel = multiplyPos(startingMousePosRelEdge!, 1/factor);
        const off = {x:scaledRel.x-edge.width, y:scaledRel.y-edge.height}
        const adjOff = multiplyPos(off,factor)
        setMouseDownPosRelEdge(adjOff)
      }
    },

    handleRightClickEdge: (
      e: React.MouseEvent<SVGGElement, MouseEvent>,
      edge: Edge,
    ): void => {
      if (Object.values(boxActive).includes(true)) return;
      e.preventDefault();
      edgeActions.handleDeleteEdge(edge.id);
    },
  };

  // ELEMENT MOVEMENT AND INTERACTION
  const handleMouseMoveElement = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    if (Object.values(boxActive).includes(true)) return;
    if (draggingNode) {
      const cursorPos: Position = getPosRelParent(e);
      if (outOfBounds(cursorPos, canvasRect)) {
        handleMouseUpElement(e);
        return;
      }

      nodeActions.handleUpdateNodePos(draggingNode, subtractPos(cursorPos, mouseDownPosRelNode!));

    } else if (draggingEdgeSegment) {
      const cursorPos: Position = getPosRelParent(e);
      if (outOfBounds(cursorPos, canvasRect)) {
        handleMouseUpElement(e);
        return;
      }

      const absPos = subtractPos(cursorPos, mouseDownPosRelEdge!);
      const delta = subtractPos(absPos, segmentDragFirstPos!)

      //need to udate here


      nodeActions.handleMassPosUpdate(draggingEdgeSegment, delta)


      setSegmentDragFirstPos(absPos)
    } else if (edging) {
      const cursorPos = getPosRelParent(e);
      setEdging({
        ...edging,
        p2: cursorPos,
      });
    }
    setMovedCurrNode(true);
    setSelectedNode(null);
    setSelectedEdge(null);
  };
  const [edgingBool, setEdgingBool] = useState<boolean>(false);

  const handleMouseUpElement = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
  ) => {
    if (shiftPressed && selectedEdge && graphConfig.edgeMode) {
      setEditingEdge(selectedEdge);
      setSelectedEdge(null);
      setEdging(null);
    } else if (shiftPressed && selectedNode) {
      setEditingNode(selectedNode);
      setSelectedNode(null);
      setEdging(null);
    } else if (draggingNode && !movedCurrNode) {
      nodeActions.handleBasicNodeClick(draggingNode);
    } else if (edging) {
      const cursorPos = getPosRelParent(e);
      const cursorNode = getNodeAt(
        cursorPos,
        graph!.nodes,
        graphConfig.circleRadius,
      )
      if (cursorNode) {
        edgeActions.handleAddEdge(edging.n1, cursorNode.id);
      }
    }
    setEdgingBool(false);
    setMovedCurrNode(false);
    setEdging(null);
    setDraggingEdgeSegment(null);
    setSegmentDragFirstPos(null);
    setDraggingNode(null);
    setMouseDownPosRelNode(null);
  };

  // =================================================================
  // ========================== Side Effects ==========================
  // =================================================================

  // CANVAS RESIZE OBSERVER
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvasRef.current) {
          const rect = entry.target.getBoundingClientRect();
          setCanvasRect(rect);
        }
      }
    });

    const initializeRect = () => {
      if (canvasRef.current) {
        requestAnimationFrame(() => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (rect) {
            setCanvasRect(rect);
          }
        });
      }
    };

    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
      initializeRect();
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // EDITING FOCUS
  useEffect(() => {
    if (editInputRef.current && (editingEdge || editingNode)) {
      editInputRef.current.focus();
    }
  }, [editInputRef, editingEdge, editingNode]);

  // =================================================================
  // ========================== Form Handlers =========================
  // =================================================================

  const handleEditEdgeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    edgeActions.handleEditEdge(editingEdge!, editingName);
    setEditingEdge(null);
    setEditingName("");
  };

  const handleEditNodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    nodeActions.handleEditNode(editingNode!, editingName);
    setEditingNode(null);
    setEditingName("");
  };

  // =================================================================
  // ============================= Physics ============================
  // =================================================================
  const [numTotalIters, setNumTotalIters] = useState(0);

  const graphRef = useRef(graph);
  const draggingRef = useRef(draggingNode);
  const edgingRef = useRef(edging);
  const canvasRectRef = useRef(canvasRect);

  useEffect(() => {
    graphRef.current = graph;
    draggingRef.current = draggingNode;
    edgingRef.current = edging;
    canvasRectRef.current = canvasRect;
  }, [graph, draggingNode, canvasRect, edging]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      NUM_MAX_PHYSICS_ITERS;
      if (graphConfig.gravityMode && !editingEdge && !editingNode)
        updateNodePositions(
          graphRef,
          draggingRef,
          edgingRef,
          canvasRectRef,
          numTotalIters,
          setNumTotalIters,
          edgingBool,
          setEdging,
          setGraphs,
        );
    }, REFRESH_RATE);

    return () => clearInterval(intervalId);
  }, [graph, graphConfig, editingEdge, editingNode]);

  // =================================================================
  // ================== Checking bidirectional Edges =================
  // =================================================================

  const handleUpdateBidirectional = () => {
    if (!graph) return;
    setBidirectional(new Set());
    const existingEdges = new Set<string>();
    graph.edges.forEach((edge) => {
      const edgeKey = JSON.stringify([edge.n1, edge.n2].sort()); // Ensure bidirectional equivalence
      if (existingEdges.has(edgeKey)) {
        setBidirectional((prev) => {
          const newSet = new Set(prev);
          newSet.add(edgeKey);
          return newSet;
        });
      } else {
        existingEdges.add(edgeKey);
      }
    });
  };

  useEffect(handleUpdateBidirectional, [graph]);


  // =================================================================
  // ============================ Zoom/Pan ===========================
  // =================================================================



  // =================================================================
  // ======================= Returned Component ======================
  // =================================================================


  return (
    <>
      {editingEdge && (
        <EditBox
          handleSubmit={handleEditEdgeSubmit}
          editInputRef={editInputRef}
          value={editingName}
          setValue={setEditingName}
          canvasRect={canvasRect}
          editingObj={editingEdge}
        />
      )}
      {editingNode && (
        <EditBox
          handleSubmit={handleEditNodeSubmit}
          editInputRef={editInputRef}
          value={editingName}
          setValue={setEditingName}
          canvasRect={canvasRect}
          editingObj={editingNode}
        />
      )}
      <div
        className="main-component main-graphpage-section"
        id="canvas-wrapper"
      >
         {graph !== null ? (<>
          {/* {graphConfig.unboundedMode && <ControlPanel
            controlPanelRef={controlPanelRef}
            zoomActions={zoomActions}
          />} */}
          <svg
            fontFamily="monospace"
            id="canvas"
            ref={canvasRef}
            onContextMenu={(e) => e.preventDefault()}
            onMouseMove={handleMouseMoveElement}
            onMouseUp={handleMouseUpElement}
            fontSize={graphConfig.fontSize}
          >
            {edging && (
              <line
                className="graph-element"
                strokeWidth={graphConfig.lineWeight}
                stroke={GRAPH_COLORS[+darkMode].line}
                x1={edging.p1.x}
                y1={edging.p1.y}
                x2={edging.p2.x}
                y2={edging.p2.y}
              ></line>
            )}

            {graph!.edges.map((edge) => {
              const node1: Node = graph!.nodes.find(node => node.id === edge.n1)!;
              const node2: Node = graph!.nodes.find(node => node.id === edge.n2)!;

              if (node1.id === node2.id) {
                return (
                  <SelfEdgeComponent
                    key={edge.id}
                    edge={edge}
                    node1={node1}
                    node2={node2}
                    edgeClickActions={edgeClickActions}
                    graphConfig={graphConfig}
                    highlighted={highlighted}
                    currColors={GRAPH_COLORS[+darkMode]}
                    bidirectional={bidirectional}
                  />
                );
              } else {
                return (
                  <EdgeComponent
                    key={edge.id}
                    edge={edge}
                    node1={node1}
                    node2={node2}
                    edgeClickActions={edgeClickActions}
                    graphConfig={graphConfig}
                    highlighted={highlighted}
                    currColors={GRAPH_COLORS[+darkMode]}
                    bidirectional={bidirectional}
                  />
                );
              }
            })}
            {graph!.nodes.map((node) => (
              <NodeComponent
                key={node.id}
                node={node}
                nodeClickActions={nodeClickActions}
                graphConfig={graphConfig}
                currColors={GRAPH_COLORS[+darkMode]}
                highlighted={highlighted}
              />
            ))}
          </svg>
        </>) : (
          <svg id="canvas" ref={canvasRef}>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: "16px" }}
              fill={GRAPH_COLORS[+darkMode].text}
            >
              {!loading && "select a graph to view it here"}
            </text>
          </svg>
        )}
      </div>
    </>
  );
}
