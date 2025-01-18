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
} from "../interfaces";
import {
  INVISIBLE_CHAR,
  GRAPH_COLORS,
  PIXELS_PER_FONT_SIZE_UNIT,
  NUM_MAX_PHYSICS_ITERS,
  REFRESH_RATE,
} from "../constants";
import {
  getPosRelParent,
  getNodeAt,
  outOfBounds,
  adjustEndpoint,
  getBidirectionalOffsets,
  getMidpoint,
} from "../utils/utils";

import {
  updateNodePositions
} from "../utils/physics"
import EditBox from "../components/EditBox";

interface Props {
  graph: Graph | null;
  nodeActions:NodeActions;
  edgeActions:EdgeActions;
  shiftPressed: boolean;
  setCanvasRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  canvasRect: DOMRect | null;
  isBoxActive: () => boolean;
  editInputRef: React.RefObject<HTMLInputElement>;
  canvasRef: React.RefObject<SVGSVGElement>;
  handleSetError: (message: string) => void;
  editingEdge: LocatedEdge | null;
  setEditingEdge: React.Dispatch<React.SetStateAction<LocatedEdge | null>>;
  editingNode: Node | null;
  setEditingNode: React.Dispatch<React.SetStateAction<Node | null>>;
  graphConfig: GraphConfig;
  setGraphs: React.Dispatch<React.SetStateAction<Map<string, Graph>>>;
  highlighted: Set<string>;
  loading: boolean;
  darkMode:boolean;
}

export default function Canvas({
  graph,
  nodeActions,
  edgeActions,
  shiftPressed,
  setCanvasRect,
  canvasRect,
  isBoxActive,
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
  darkMode
}: Props) {
  // =================================================================
  // ========================== State Variables ========================
  // =================================================================

  const [dragPos, setDragPos] = useState<Position | null>(null);
  const [dragging, setDragging] = useState<Node | null>(null);
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

  const handleRightClickNode = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    node: Node,
  ) => {
    if (isBoxActive()) return;
    e.preventDefault();
    nodeActions.handleDeleteNode(node.id);
  };

  // NODE INTERACTIONS
  const handleMouseDownNode = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    node: Node,
  ) => {
    if (isBoxActive()) return;
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
      setDragging(node);
      const charWidth = graphConfig.fontSize * PIXELS_PER_FONT_SIZE_UNIT;
      const numChars = node.value.length;
      const totalWidth = charWidth * numChars;
      const halfWidth = totalWidth / 2;
      const halfOver = Math.max(0, halfWidth - graphConfig.circleRadius);
      setDragPos({
        x: startingMousePosRelCircle.x - graphConfig.circleRadius - halfOver,
        y: startingMousePosRelCircle.y - graphConfig.circleRadius,
      });
    }
  };

  // EDGE INTERACTIONS
  const handleMouseDownEdge = (
    //these are working
    e: React.MouseEvent<SVGElement, MouseEvent>,
    edge: LocatedEdge,
  ) => {
    if (isBoxActive()) return;
    e.preventDefault();
    if (shiftPressed) {
      setSelectedEdge(edge);
    }
  };

  const handleRightClickEdge = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    edge: Edge,
  ) => {
    if (isBoxActive()) return;
    e.preventDefault();
    edgeActions.handleDeleteEdge(edge.id);
  };

  // ELEMENT MOVEMENT AND INTERACTION
  const handleMouseMoveElement = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    if (isBoxActive()) return;
    if (dragging) {
      const cursorPos: Position = getPosRelParent(e);
      if (outOfBounds(cursorPos, canvasRect)) {
        handleMouseUpElement(e);
        return;
      }
      nodeActions.handleUpdateNodePos(dragging.id, {
        x: cursorPos.x - dragPos!.x,
        y: cursorPos.y - dragPos!.y,
      });
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
    } else if (dragging && !movedCurrNode) {
      nodeActions.handleBasicNodeClick(dragging.id);
    } else if (edging) {
      const cursorPos = getPosRelParent(e);
      const cursorNode = getNodeAt(
        cursorPos,
        graph!.nodes,
        graphConfig.circleRadius,
      );
      if (cursorNode) {
        edgeActions.handleAddEdge(edging.n1, cursorNode.id);
      }
    }
    setEdgingBool(false);
    setMovedCurrNode(false);
    setEdging(null);
    setDragging(null);
    setDragPos(null);
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
  const draggingRef = useRef(dragging);
  const edgingRef = useRef(edging);
  const canvasRectRef = useRef(canvasRect);

  useEffect(() => {
    graphRef.current = graph;
    draggingRef.current = dragging;
    edgingRef.current = edging;
    canvasRectRef.current = canvasRect;
  }, [graph, dragging, canvasRect, edging]);

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
          setGraphs
        );
    }, REFRESH_RATE);

    return () => clearInterval(intervalId);
  }, [graph, graphConfig, editingEdge, editingNode]);



  // =================================================================
  // ================== Checking bidirectional Edges =================
  // =================================================================

  const handleUpdateBidirectional = () => {
    if (!graph) return;
    setBidirectional(new Set())
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
  }


  useEffect(handleUpdateBidirectional, [graph]);


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
        {graph !== null ? (
          <svg
            fontFamily="monospace"
            id="canvas"

            ref={canvasRef}
            onContextMenu={(e) => e.preventDefault()}
            onMouseMove={handleMouseMoveElement}
            onMouseUp={handleMouseUpElement}
            fontSize={graphConfig.fontSize}
          >
            <defs>
              <marker
                id="this-arrow-head-self"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX="10"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth={6 * graphConfig.lineWeight}
                markerHeight={6 * graphConfig.lineWeight}
                orient="auto-start-reverse"
                fill={GRAPH_COLORS[+darkMode].line}
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker
                id="this-arrow-head"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX="9.5"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth={6 * graphConfig.lineWeight}
                markerHeight={6 * graphConfig.lineWeight}
                orient="auto-start-reverse"
                fill={GRAPH_COLORS[+darkMode].line}
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker
                id="this-arrow-head-red"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX="9.5"
                refY="5"
                markerUnits="userSpaceOnUse"
                markerWidth={6 * graphConfig.lineWeight}
                markerHeight={6 * graphConfig.lineWeight}
                orient="auto-start-reverse"
                fill="red"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
            </defs>
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
          const node1: Node | undefined = graph!.nodes.find(
            (node) => node.id === edge.n1,
          );
          const node2: Node | undefined = graph!.nodes.find(
            (node) => node.id === edge.n2,
          );
          if (!node1 || !node2) {
            return;
          }

          if (node1.id === node2.id) {
            const SELF_EDGE_HEIGHT = graphConfig.circleRadius * 2.5;  // Reduced height for tighter loop
            const SELF_EDGE_WIDTH = graphConfig.circleRadius * 1.5;   // Adjusted width for teardrop shape

            const startX = node1.pos.x;
            const startY = node1.pos.y - graphConfig.circleRadius*.75;

            // Create a teardrop shape with sharper bottom point
            const pathData = `
              M ${startX} ${startY}
              C ${startX + SELF_EDGE_WIDTH} ${startY},
                ${startX + SELF_EDGE_WIDTH} ${startY - SELF_EDGE_HEIGHT * 0.8},
                ${startX} ${startY - SELF_EDGE_HEIGHT}
              C ${startX - SELF_EDGE_WIDTH} ${startY - SELF_EDGE_HEIGHT * 0.8},
                ${startX - SELF_EDGE_WIDTH} ${startY},
                ${startX} ${startY}
            `; // ${startX - SELF_EDGE_WIDTH * 0.5} ${startY + SELF_EDGE_HEIGHT * 0.3}


            const labelPos: Position = {
              x: startX,
              y: startY - SELF_EDGE_HEIGHT
            };

            return (
              <g
                style={{ userSelect: "none" }}
                key={edge.id}
                onMouseDown={(e) => handleMouseDownEdge(e, { ...edge, pos: labelPos })}
                onContextMenu={(e) => handleRightClickEdge(e, edge)}
              >
                <path
                  d={pathData}
                  fill="none"
                  stroke={GRAPH_COLORS[+darkMode].line}
                  strokeWidth={graphConfig.lineWeight * 5}
                  opacity={0}
                />

                <path
                  d={pathData}
                  fill="none"
                  stroke={highlighted && highlighted.has(edge.id) ? "red" : GRAPH_COLORS[+darkMode].line}
                  strokeWidth={graphConfig.lineWeight}
                  {...(graphConfig.directedMode && {
                    markerEnd: `url(#this-arrow-head${highlighted.has(edge.id) ? "-red" : "-self"})`
                  })}
                />

                {graphConfig.edgeMode && (
                  <>
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      dy="0.35em"
                      strokeWidth={0.4 * graphConfig.fontSize}
                      className="invisible-edge-text"
                      textAnchor="middle"
                    >
                      {INVISIBLE_CHAR.repeat(edge.value.length)}
                    </text>
                    <text
                      textAnchor="middle"
                      x={labelPos.x}
                      y={labelPos.y}
                      dy="0.35em"
                      className="edge-text"
                    >
                      {edge.value}
                    </text>
                  </>
                )}
              </g>
            );
          } else {
            const offsets : Position = (bidirectional.has(JSON.stringify([edge.n1, edge.n2].sort()))) ?
              getBidirectionalOffsets(node1.pos, node2.pos)
              :
              {x:0,y:0};
            const labelPos: Position = {
              x: getMidpoint(node1.pos.x, node2.pos.x) + offsets.x,
              y: getMidpoint(node1.pos.y, node2.pos.y) + offsets.y,
            };

            return (
              <g
                style={{ userSelect: "none" }}
                key={edge.id}
                onMouseDown={(e) =>
                  handleMouseDownEdge(e, { ...edge, pos: labelPos })
                }
                onContextMenu={(e) => handleRightClickEdge(e, edge)}
              >
                <line
                  x1={node1.pos.x}
                  y1={node1.pos.y}
                  x2={node2.pos.x}
                  y2={node2.pos.y}
                  opacity={0}
                  stroke={GRAPH_COLORS[+darkMode].line}
                  strokeWidth={graphConfig.lineWeight * 5}
                />
                <line
                  x1={adjustEndpoint(node2.pos, node1.pos, graphConfig.circleRadius).x}
                  y1={adjustEndpoint(node2.pos, node1.pos, graphConfig.circleRadius).y}
                  x2={adjustEndpoint(node1.pos, node2.pos, graphConfig.circleRadius).x}
                  y2={adjustEndpoint(node1.pos, node2.pos, graphConfig.circleRadius).y}
                  stroke={
                    highlighted && highlighted.has(edge.id) ? "red" : GRAPH_COLORS[+darkMode].line
                  }
                  strokeWidth={graphConfig.lineWeight}
                  {...(graphConfig.directedMode && {
                    markerEnd: `url(#this-arrow-head${highlighted.has(edge.id) ? "-red" : ""})`,
                  })}
                />
                {graphConfig.edgeMode && (
                  <>
                    <text
                      x={labelPos.x}
                      y={labelPos.y}
                      dy="0.35em"
                      strokeWidth={0.4 * graphConfig.fontSize}
                      className="invisible-edge-text"
                      textAnchor="middle"
                    >
                      {INVISIBLE_CHAR.repeat(edge.value.length)}
                    </text>
                    <text
                      textAnchor="middle"
                      x={labelPos.x}
                      y={labelPos.y}
                      dy="0.35em"
                      className="edge-text"
                    >
                      {edge.value}
                    </text>
                  </>
                )}
              </g>
            );
          }
        })}

            {graph!.nodes.map((node) => (
              <g
                key={node.id}
                onMouseDown={(e) => handleMouseDownNode(e, node)}
                onContextMenu={(e) => handleRightClickNode(e, node)}
              >
                <circle
                  cx={node.pos.x}
                  cy={node.pos.y}
                  r={graphConfig.circleRadius}
                  fill={node.customColor ? node.customColor : GRAPH_COLORS[+darkMode].main}
                  strokeWidth={graphConfig.lineWeight}
                  stroke={
                    highlighted && highlighted.has(node.id) ? "red" : GRAPH_COLORS[+darkMode].line
                  }
                />
                <text
                  x={node.pos.x}
                  y={node.pos.y}
                  dy="0.35em"
                  strokeWidth={0.4 * graphConfig.fontSize}
                  stroke={node.customColor ? node.customColor : GRAPH_COLORS[+darkMode].main}
                  textAnchor="middle"
                >
                  {INVISIBLE_CHAR.repeat(node.value.length)}
                </text>
                <text
                  textAnchor="middle"
                  x={node.pos.x}
                  y={node.pos.y}
                  dy="0.35em"
                >
                  {node.value}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <svg id="canvas" ref={canvasRef}>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: "16px" }}
            >
              {!loading && "select a graph to view it here"}
            </text>
          </svg>
        )}

      </div>
    </>
  );
}
