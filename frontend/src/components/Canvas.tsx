import { useState, useEffect, useRef } from "react";
import {
  Node,
  Position,
  Edge,
  TempEdge,
  LocatedEdge,
  Graph,
  GraphConfig,
} from "../interfaces";
import {
  INVISIBLE_CHAR,
  GRAPH_COLORS,
  PIXELS_PER_FONT_SIZE_UNIT,
  GRAVITATIONAL_CONSTANT,
  NUM_MAX_PHYSICS_ITERS,
  DAMPING,
  DELTA_TIME,
  MOVEMENT_THRESHOLD,
  REFRESH_RATE,
  PERP_LEN,
} from "../constants";
import {
  getPosRelParent,
  getNodeAt,
  outOfBounds,
  getMidpoint,
  addPos,
  subtractPos,
  multiplyPos,
  lengthPos,
  getBoundedPosition,
} from "../utils/utils";
import EditBox from "../components/EditBox";

interface Props {
  graph: Graph | null;
  handleAddEdge: (n1: string, n2: string) => void;
  handleDeleteNode: (id: string) => void;
  handleUpdateNodePos: (id: string, pos: Position) => void;
  handleDeleteEdge: (id: string) => void;
  shiftPressed: boolean;
  setCanvasRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  canvasRect: DOMRect | null;
  handleEditNode: (node: Node, newValue: string) => void;
  handleEditEdge: (edge: Edge, newValue: string) => void;
  isBoxActive: () => boolean;
  editInputRef: React.RefObject<HTMLInputElement>;
  handleBasicNodeClick: (id: string) => void;
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
  handleAddEdge,
  handleDeleteNode,
  handleUpdateNodePos,
  handleDeleteEdge,
  shiftPressed,
  setCanvasRect,
  canvasRect,
  handleEditNode,
  handleEditEdge,
  isBoxActive,
  editInputRef,
  handleBasicNodeClick,
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

  // =================================================================
  // ======================== Mouse Handlers ==========================
  // =================================================================

  const handleRightClickNode = (
    e: React.MouseEvent<SVGGElement, MouseEvent>,
    node: Node,
  ) => {
    if (isBoxActive()) return;
    e.preventDefault();
    handleDeleteNode(node.id);
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
    handleDeleteEdge(edge.id);
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
      handleUpdateNodePos(dragging.id, {
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
      handleBasicNodeClick(dragging.id);
    } else if (edging) {
      const cursorPos = getPosRelParent(e);
      const cursorNode = getNodeAt(
        cursorPos,
        graph!.nodes,
        graphConfig.circleRadius,
      );
      if (cursorNode) {
        handleAddEdge(edging.n1, cursorNode.id);
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
    handleEditEdge(editingEdge!, editingName);
    setEditingEdge(null);
    setEditingName("");
  };

  const handleEditNodeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleEditNode(editingNode!, editingName);
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

  function updateNodePositions() {
    const currentGraph = graphRef.current;
    if (!currentGraph || !canvasRect) return;

    let anyNodeMoved = false; // Track if any node had significant movement

    const updatedGraph = {
      ...currentGraph,
      nodes: currentGraph.nodes.map((node) => {
        if (
          draggingRef.current !== null &&
          node.id === draggingRef.current.id
        ) {
          return node;
        } else {
          const centerX = canvasRect.width / 2;
          const centerY = canvasRect.height / 2;

          const k = Math.sqrt(
            (canvasRect.width * canvasRect.height) / currentGraph.nodes.length,
          );

          let force = { x: 0, y: 0 }; //anynode updated with num

          const distanceToCenter = subtractPos(
            { x: centerX, y: centerY },
            node.pos,
          );
          const centerDistance = lengthPos(distanceToCenter);
          if (centerDistance > k * 3) {
            force = addPos(
              force,
              multiplyPos(
                distanceToCenter,
                (GRAVITATIONAL_CONSTANT * (centerDistance - k * 3)) /
                  centerDistance,
              ),
            );
          }

          currentGraph.nodes.forEach((otherNode) => {
            if (node.id !== otherNode.id) {
              const diff = subtractPos(node.pos, otherNode.pos);
              const distance = Math.max(k / 2, lengthPos(diff));
              const repulsionForce = ((k * k) / (distance * distance)) * 0.3;
              force = addPos(
                force,
                multiplyPos(diff, repulsionForce / distance),
              );
            }
          });

          currentGraph.edges.forEach((edge) => {
            if (edge.n1 === node.id || edge.n2 === node.id) {
              const otherNodeId = edge.n1 === node.id ? edge.n2 : edge.n1;
              const otherNode = currentGraph.nodes.find(
                (n) => n.id === otherNodeId,
              );

              if (otherNode) {
                const diff = subtractPos(otherNode.pos, node.pos);
                const distance = lengthPos(diff);
                const springForce = (distance - k) * 0.15;
                force = addPos(
                  force,
                  multiplyPos(diff, springForce / distance),
                );
              }
            }
          });

          force = multiplyPos(force, DAMPING * DELTA_TIME);

          // Clear threshold - if movement is below this, node stops completely
          // seems tk be some edge length variable/constant force

          let newPos = addPos(node.pos, force);

          const margin = k / 2;
          const boundaryForce = 0.05;
          if (newPos.x < margin)
            newPos.x += (margin - newPos.x) * boundaryForce;
          if (newPos.x > canvasRect.width - margin)
            newPos.x -=
              (newPos.x - (canvasRect.width - margin)) * boundaryForce;
          if (newPos.y < margin)
            newPos.y += (margin - newPos.y) * boundaryForce;
          if (newPos.y > canvasRect.height - margin)
            newPos.y -=
              (newPos.y - (canvasRect.height - margin)) * boundaryForce;

          newPos = getBoundedPosition(newPos, canvasRect);

          const displacement: number = Math.abs(
            lengthPos(node.pos) - lengthPos(newPos),
          );

          if (displacement > MOVEMENT_THRESHOLD) {
            anyNodeMoved = true;
          }

          const ITERS_PER_UPDATE: number = Math.round(20 / REFRESH_RATE);

          if (
            edgingBool &&
            edging &&
            edging.n1 == node.id &&
            numTotalIters % ITERS_PER_UPDATE === 0
          ) {
            setEdging((prevEdging) => {
              if (prevEdging === null) {
                return null;
              }
              return {
                ...prevEdging,
                p1: newPos,
              };
            });
          }

          return {
            ...node,
            pos: newPos,
          };
        }
      }),
    };

    // Only update if at least one node had significant movement
    if (!anyNodeMoved) {
      return;
    }

    setGraphs((prevGraphs) => {
      const newGraphs = new Map(prevGraphs);
      newGraphs.set(updatedGraph.id, updatedGraph);
      return newGraphs;
    });
    setNumTotalIters((p) => p + 1);
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      NUM_MAX_PHYSICS_ITERS;
      if (graphConfig.gravityMode && !editingEdge && !editingNode)
        updateNodePositions();
    }, REFRESH_RATE);

    return () => clearInterval(intervalId);
  }, [graph, graphConfig, editingEdge, editingNode]);



  // =================================================================
  // ================== Checking bidirectional Edges =================
  // =================================================================

  const [bidirectional, setBidirectional] = useState<Set<string>>(new Set());

  useEffect(() => {
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
  }, [graph]);


  // =================================================================
  // ======================== Gesture/Movement =======================
  // =================================================================


    const wrapperRef = useRef<HTMLDivElement>(null);





    // const handleTouchMove = (e: WheelEvent) => {
    //   e.preventDefault();
    //   console.log("wheeel")
    // };





    // useEffect(() => {
    //   const element = wrapperRef.current;
    //   if (!element) return;
    //   console.log("found")


    //   element.addEventListener('wheel', handleTouchMove, { passive: false });

    //   return () => {

    //     element.removeEventListener('wheel', (e) => e.preventDefault());
    //   };
    // }, [wrapperRef]);


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
        ref={wrapperRef}

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
                id="this-arrow-head"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX={graphConfig.circleRadius + 4}
                refY="5"
                markerWidth={12 / graphConfig.lineWeight}
                markerHeight={12 / graphConfig.lineWeight}
                orient="auto-start-reverse"
                fill={GRAPH_COLORS[+darkMode].line}
              >
                <path d="M 0 0 L 10 5 L 0 10 z" />
              </marker>
              <marker
                id="this-arrow-head-red"
                className="arrow-head"
                viewBox="0 0 10 10"
                refX={graphConfig.circleRadius + 4}
                refY="5"
                markerWidth={12 / graphConfig.lineWeight}
                markerHeight={12 / graphConfig.lineWeight}
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
              const yNeg: boolean = node2.pos.y - node1.pos.y < 0;
              let dx = 0;
              let dy = 0;

              if (bidirectional.has(JSON.stringify([edge.n1, edge.n2].sort()))) {
                if (Math.abs(node1.pos.y - node2.pos.y) < .00001) {
                  dx = 0;
                  dy = node2.pos.x > node1.pos.x ? PERP_LEN : -PERP_LEN;
                } else {
                  const slope = (node2.pos.y - node1.pos.y) / (node2.pos.x - node1.pos.x);
                  const p_slope = -(1 / (slope + 0.0000001));
                  dx = -Math.sqrt((PERP_LEN * PERP_LEN) / (1 + p_slope * p_slope));
                  dy = p_slope * dx;
                }
              }
              const labelPos: Position = {
                x: getMidpoint(node1.pos.x, node2.pos.x) + (yNeg ? -1 : 1) * dx,
                y: getMidpoint(node1.pos.y, node2.pos.y) + (yNeg ? -1 : 1) * dy,
              };


              return (
                <g
                  style={{ userSelect: "none" }}
                  key={edge.id}
                  onMouseDown={(e) =>
                    handleMouseDownEdge(e, { ...edge, pos: labelPos })
                  } //not tracking properly.
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
                    x1={node1.pos.x}
                    y1={node1.pos.y}
                    x2={node2.pos.x}
                    y2={node2.pos.y}
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
                        {edge.value} {/* should be fine */}
                      </text>
                    </>
                  )}
                </g>
              );
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
