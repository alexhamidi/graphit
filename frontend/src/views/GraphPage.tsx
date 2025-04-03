import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useState, useEffect, useCallback, useRef } from "react";
import Canvas from "../components/Canvas";
import Options from "../components/Options";
import AiBox from "../components/AiBox";
import InfoBox from "../components/InfoBox";
import NewBlankGraphBox from "../components/NewBlankGraphBox";
import NewTextGraphBox from "../components/NewTextGraphBox";
import Header from "../components/Header";
import Error from "../components/Error";
import TopBox from "../components/TopBox";
import QueryBox from "../components/QueryBox"
import {
  Graph,
  Position,
  Node,
  Edge,
  LocatedEdge,
  PageProps,
  GraphConfig,
  BoxActive,
  MiniEdge,
  SelectingAlgo,
} from "../interfaces";
import { authorizedFetch, authorizedPost, post } from "../networking";
import {
  fetchEmail,
  getNodeAt,
  getPosRelRect,
  outOfBounds,
  getBoundedPosition,
  addPos,
} from "../utils/utils";
import { saveGraphCPP, saveGraphPNG } from "../utils/saving";
import { debounce } from "lodash";
import {
  DEFAULT_ERROR,
  CLOUD_SAVE_FAIL_ERROR,
  CLOUD_FETCH_FAIL_ERROR,
  DEFAULT_GRAPH_CONFIG,
  DEFAULT_BOX_ACTIVE,
  DEFAULT_SELECTING_ALGO,
} from "../constants";
import { AlgorithmService } from "../algorithms";

export default function GraphPage({
  setAuthenticated,
  authenticated,
  darkMode,
  toggleDarkMode,
}: PageProps) {
  // =================================================================
  // ========================== Declarations ==========================
  // =================================================================

  // IDENTITY
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // GRAPHS
  const [graphs, setGraphs] = useState<Map<string, Graph>>(new Map());
  const [currGraph, setCurrGraph] = useState<string>("");

  // EDITING
  const [editingEdge, setEditingEdge] = useState<LocatedEdge | null>(null);
  const [editingNode, setEditingNode] = useState<Node | null>(null);

  // CANVAS
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [unsaved, setUnsaved] = useState<boolean>(false);

  // GRAPH SETTINGS
  const [graphConfig, setGraphConfig] = useState<GraphConfig>(() => {
    const stored = localStorage.getItem("graphConfig");
    if (stored) {
      return JSON.parse(stored);
    }
    return DEFAULT_GRAPH_CONFIG;
  });
  const [highlightClicking, setHighlightClicking] = useState<boolean>(false);

  // KEYS
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);

  const [metaPressed, setMetaPressed] = useState<boolean>(false);

  // MOUSE
  const [mouseDownStationary, setMouseDownStationary] =
    useState<boolean>(false);
  const [mouseDownEdgeStationary, setMouseDownEdgeStationary] = useState<string | null>(null);

  // VISIBILITY
  const [boxActive, setBoxActive] = useState<BoxActive>(DEFAULT_BOX_ACTIVE);
  const [graphPopupActive, setGraphPopupActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem("collapsed");
    if (stored) {
      return stored == "true";
    }
    return false;
  });

  // ALGORITHMS
  const [selectingAlgo, setSelectingAlgo] = useState<SelectingAlgo>(
    DEFAULT_SELECTING_ALGO,
  );
  const [highlighted, setHighlighted] = useState<Set<string>>(
    new Set<string>(),
  );
  const [message, setMessage] = useState<string>("");
  const [resetShown, setResetShown] = useState<boolean>(false);

  const [searchValueInputShown, setSearchValueInputShown] =
    useState<boolean>(false);
  const [searchValueInput, setSearchValueInput] = useState<string>("");

  // REFS
  const editInputRef = useRef<HTMLInputElement>(null);
  const graphSelectPopupRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const controlPanelRef = useRef<HTMLDivElement>(null);
  const searchValueInputRef = useRef<HTMLInputElement>(null);

  // OTHER
  const navigate = useNavigate();

  const algorithmService = new AlgorithmService();

  // =================================================================
  // ========================== Auth Actions ==========================
  // =================================================================

  // VALIDATE USER
  useEffect(() => {
    authActions.checkAuth();
  }, [setAuthenticated]);

  const authActions = {
    // check auth
    checkAuth: async () => {
      const currToken = localStorage.getItem("token");
      if (!currToken) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const email: string | null = await fetchEmail(currToken);
      if (!email) {
        authActions.handleLogout();
        setLoading(false);
      } else {
        setAuthenticated(true);
        setEmail(email);
        setToken(currToken);
      }
    },

    // LOGOUT
    handleLogout: () => {
      setAuthenticated(false);
      setGraphs(new Map()); // need to store everything here
      setCurrGraph("");
      setEmail(null);
      setGraphConfig(DEFAULT_GRAPH_CONFIG);
      localStorage.clear();
      localStorage.setItem("darkMode", darkMode.toString());
    },

    // LOGIN
    handleLogin: () => {
      navigate("/login");
    },
  };

  // =================================================================
  // ============================ Caching ============================
  // =================================================================

  // CACHE GRAPH OPTIONS
  useEffect(() => {
    localStorage.setItem("graphConfig", JSON.stringify(graphConfig));
  }, [graphConfig]);

  useEffect(() => {
    localStorage.setItem("collapsed", collapsed.toString());
  }, [collapsed]);

  // FETCH CURRGRAPH - need to wait for graphs
  useEffect(() => {
    const prevGraph: string | null = localStorage.getItem("currGraph");
    if (prevGraph !== null && graphs.has(prevGraph)) {
      setCurrGraph(prevGraph);
    }
  }, [graphs, setCurrGraph]);

  // FETCH OPTIONS in declarataion

  // =================================================================
  // ========================= Graph Actions =========================
  // =================================================================


  const graphActions = {
    handleOrderNodes: (ids: string[]) => {
      const midPoint: number = canvasRect!.height/2;
      const distForEach: number = canvasRect!.width/ids.length;
      ids.forEach((nodeID, idx) => {
        nodeActions.handleUpdateNodePos(nodeID, {x:idx*distForEach+distForEach/2,y:midPoint});
      })
    },

    handleReplaceCurrGraph: (graph: Graph) => {
      graphActions.handleDeleteGraph();
      graphActions.handleAddGraph(graph);
    },

    handleNewGraphFromInput: (
      name: string,
      nodeValues: string[],
      edgeValues: MiniEdge[],
      referringIds: boolean,
    ) => {
      const newGraph: Graph = new Graph(name);

      if (referringIds) {
        nodeValues.forEach((line) => {
          const values: string[] = line.split(" ");
          const id = values[0];
          const value = values.slice(1).join(" "); // Correctly joins the remaining words
          const newNode: Node = new Node(
            canvasRect,
            graphConfig.currentChosenColor,
            undefined,
            value,
            id
          );
          newGraph.nodes.push(newNode);
        });

        edgeValues.forEach(([n1Id, n2Id, edgeValue]) => {
          if (n1Id && n2Id && n1Id !== n2Id) {
            const newEdge: Edge = new Edge(n1Id, n2Id, graphConfig.currentChosenColor, edgeValue);
            newGraph.edges.push(newEdge);
          }
        });
      } else {
        const nodeIdMap = new Map<string, string>();
        nodeValues.forEach((value) => {
          const newNode: Node = new Node(
            canvasRect,
            graphConfig.currentChosenColor,
            undefined,
            value,
          );
          nodeIdMap.set(value, newNode.id);
          newGraph.nodes.push(newNode);
        });
        edgeValues.forEach(([node1Value, node2Value, edgeValue]) => {
          const n1Id = nodeIdMap.get(node1Value);
          const n2Id = nodeIdMap.get(node2Value);
          if (n1Id && n2Id && n1Id !== n2Id) {
            const newEdge: Edge = new Edge(n1Id, n2Id, graphConfig.currentChosenColor, edgeValue);
            newGraph.edges.push(newEdge);
          }
        });
      }
      graphActions.handleAddGraph(newGraph);
    },

    // CREATE AND SAVE EMPTY GRAPH
    handleNewGraph: (name: string) => {
      const newGraph: Graph = new Graph(name);
      graphActions.handleAddGraph(newGraph);
    },

    // ADD GRAPH
    handleAddGraph: (graph: Graph) => {
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        updatedGraphs.set(graph.id, graph);
        return updatedGraphs;
      });
      graphActions.setAndCacheCurrGraph(graph.id);
    },

    // DELETE GRAPH
    handleDeleteGraph: () => {
      algoActions.handleEndAlgorithm();
      setGraphs((prevGraphs) => {
        const newGraphs = new Map(prevGraphs);
        newGraphs.delete(currGraph);
        return newGraphs;
      });
      localStorage.removeItem("currGraph");
      setCurrGraph("");
    },

    // SAVE GRAPH
    handleSaveGraph: async () => {
      if (!authenticated || !token) return;
      try {
        await authorizedPost("/graphs", Object.fromEntries(graphs), token);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 401) {
          setErrorMessage("Session Expired")
          authActions.handleLogout();
        }
        console.error(CLOUD_SAVE_FAIL_ERROR);
      }
    },

    // SET AND CACHE GRAPHS
    setAndCacheCurrGraph: (id: string) => {
      setCurrGraph(id);
      if (authenticated) localStorage.setItem("currGraph", id);
    },

    // FETCH GRAPHS
    handleFetchGraphs: async () => {
      if (!authenticated || !token) {
        return;
      }
      try {
        const response = await authorizedFetch("/graphs", token);
        const graphs: Map<string, Graph> = new Map(
          Object.entries(response.data.graphs),
        );
        setGraphs(graphs);
        setLoading(false);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 401) {
          setErrorMessage("Session Expired")
          authActions.handleLogout();
        }
        setErrorMessage(CLOUD_FETCH_FAIL_ERROR);
      }
    },
  };

  useEffect(() => {
    if (!unsaved && graphs.size > 0) {
      setUnsaved(true);
    }
  }, [graphs]);

  useEffect(() => {
    graphActions.handleFetchGraphs();
  }, [token, authenticated]);

  // SAVE GRAPH TO CLOUD REGULARLY
  const debouncedSaveGraph = useCallback(
    debounce(() => {
      graphActions.handleSaveGraph();
      setUnsaved(false);
    }, 1000),
    [graphActions.handleSaveGraph],
  );

  useEffect(() => {
    if (authenticated && token) {
      debouncedSaveGraph();
    }
    return () => debouncedSaveGraph.cancel();
  }, [graphs, authenticated, token]);

  // =================================================================
  // ========================== Node Actions ==========================
  // =================================================================

  const nodeActions = {
    // ADD NODE
    handleAddNode: (cursorPos: Position, newValue?: string) => {
      const newNode: Node = new Node(
        canvasRect,
        graphConfig.currentChosenColor,
        cursorPos,
        newValue,
      );
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          nodes: [...prevGraph.nodes, newNode],
        });
        return updatedGraphs;
      });
    },

    // DELETE NODE
    handleDeleteNode: (id: string) => {
      if (highlighted.has(id) && Object.values(selectingAlgo).includes(true)) {
        algoActions.handleEndAlgorithm();
      }
      miscActions.handleCancelEditing();
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;

        updatedGraphs.set(currGraph, {
          ...prevGraph,
          nodes: prevGraph.nodes.filter((node) => node.id !== id),
          edges: prevGraph.edges.filter(
            (edge) => edge.n1 !== id && edge.n2 !== id,
          ),
        });
        return updatedGraphs;
      });
    },

    // UPDATE NODE COLOR or do others
    handleBasicNodeClick: (id: string) => {
      if (Object.values(selectingAlgo).includes(true)) {
        setHighlighted((prev) => new Set(prev).add(id));
        return;
      }
      if (graphConfig.currentChosenColor === null) {
        return;
      }
      setGraphs((prevGraphs) => { //maybe nodecolor function
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        const newColor = graphConfig.currentChosenColor!;
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          nodes: prevGraph.nodes.map((node) =>
            node.id === id ? { ...node, customColor: newColor } : node,
          ),
        });
        return updatedGraphs;
      });
    },


    handleMassPosUpdate: (ids: Set<string>, delta: Position) => {
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          nodes: prevGraph.nodes.map((node) =>
             ids.has(node.id) ? { ...node, pos:
              getBoundedPosition(addPos(node.pos, delta), canvasRect, graphConfig.circleRadius)
            } : node,
          ),
        });
        return updatedGraphs;
      });
    },



    // UPDATE NODE POSITION
    handleUpdateNodePos: (id: string, pos: Position) => {
      setGraphs((prevGraphs) => {
          //canvasrect not properly updated here
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        let newPos: Position = getBoundedPosition(pos, canvasRect, graphConfig.circleRadius)
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          nodes: prevGraph.nodes.map((node) =>
            node.id === id ? { ...node, pos:newPos} : node, //distance from center * scale
          ),
        });
        return updatedGraphs;
      });
    },

    // EDIT NODE
    handleEditNode: (editNode: Node, newValue: string) => {
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          nodes: prevGraph.nodes.map((node) =>
            node.id === editNode.id ? { ...node, value: newValue } : node,
          ),
        });
        return updatedGraphs;
      });
    },
  };

  // =================================================================
  // ========================== Edge Actions ==========================
  // =================================================================

  const edgeActions = {
    // ADD EDGE
    handleAddEdge: (n1: string, n2: string) => {
      const newEdge = new Edge(n1, n2, graphConfig.currentChosenColor)
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        const edgeExists = prevGraph.edges.some(
          (edge) => edge.n1 === n1 && edge.n2 === n2,
        );

        if (edgeExists) {
          return prevGraphs;
        }

        updatedGraphs.set(currGraph, {
          ...prevGraph,
          edges: [...prevGraph.edges, newEdge],
        });

        return updatedGraphs;
      });
    },
    handleBasicEdgeClick: (id: string) => {
      console.log("changing color")
      if (graphConfig.currentChosenColor === null) {
        return;
      }
      setGraphs((prevGraphs) => { //maybe nodecolor function
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        const newColor = graphConfig.currentChosenColor!;
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          edges: prevGraph.edges.map((edge) =>
            edge.id === id ? { ...edge, customColor: newColor } : edge,
          ),
        });
        return updatedGraphs;
      });
    },

    // DELETE EDGE
    handleDeleteEdge: (id: string) => {
      miscActions.handleCancelEditing();
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;

        updatedGraphs.set(currGraph, {
          ...prevGraph,
          edges: prevGraph.edges.filter((edge) => edge.id !== id),
        });
        return updatedGraphs;
      });
    },

    // EDIT EDGE
    handleEditEdge: (editEdge: Edge, newValue: string) => {
      setGraphs((prevGraphs) => {
        const updatedGraphs = new Map(prevGraphs);
        const prevGraph = prevGraphs.get(currGraph)!;
        updatedGraphs.set(currGraph, {
          ...prevGraph,
          edges: prevGraph.edges.map((edge) =>
            edge.id === editEdge.id ? { ...edge, value: newValue } : edge,
          ),
        });
        return updatedGraphs;
      });
    },
  };

  // =================================================================
  // ========================== Key Handling ==========================
  // =================================================================

  // UPDATE
  const keyActions = {
    handleKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftPressed(true);
      } else if (e.key === "Meta") {
        setMetaPressed(true);
      } else if (e.key === "k" && metaPressed) {
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, aiBox: true });
      } else if (e.key === "b" && metaPressed) {
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, newBlankGraphBox: true });
      } else if (e.key === "i" && metaPressed) {
        setBoxActive({ ...DEFAULT_BOX_ACTIVE, newTextGraphBox: true });
      } else if (e.key === "h" && metaPressed) {
        if (currGraph === "") {
          setErrorMessage("Must choose a graph before querying");
        } else {
          setBoxActive({ ...DEFAULT_BOX_ACTIVE, queryBox: true });
        }
      } else if (e.key == "Escape") {
        miscActions.handleCancelAllActive();
      }
    },
    handleKeyUp: () => {
      setShiftPressed(false);
      setMetaPressed(false);
    },
  };

  useEffect(() => {
    window.addEventListener("keydown", keyActions.handleKeyDown);
    window.addEventListener("keyup", keyActions.handleKeyUp);
    return () => {
      window.removeEventListener("keydown", keyActions.handleKeyDown);
      window.removeEventListener("keyup", keyActions.handleKeyUp);
    };
  }, [metaPressed]);

  // =================================================================
  // ========================= Mouse Handling =========================
  // =================================================================
  const mouseActions = {
    // MOUSE DOWN
    handleMouseDown: (e: MouseEvent) => {
      if (
        editInputRef.current &&
        !editInputRef.current.contains(e.target as globalThis.Node)
      ) {
        setEditingNode(null);
        setEditingEdge(null);
        return;
      }
      if (graphPopupActive) {
        if (
          graphSelectPopupRef.current &&
          !graphSelectPopupRef.current.contains(e.target as globalThis.Node)
        ) {
          setGraphPopupActive(false);
        }
        return;
      } else if (e.button === 0) {
        setMouseDownStationary(true);
      }
    },

    // MOUSE MOVE
    handleMouseMove: (e: MouseEvent) => {
      if (!e.shiftKey) {
        setShiftPressed(false);
      }
      setMouseDownStationary(false);
    },

    // MOUSE UP
    handleMouseUp: (e: MouseEvent) => {
      if (
        !shiftPressed &&
        mouseDownStationary &&
        currGraph !== "" &&
        !editingEdge &&
        !editingNode &&
        !Object.values(boxActive).includes(true) &&
        !(controlPanelRef && controlPanelRef.current && controlPanelRef.current.contains(e.target as globalThis.Node)) &&
        canvasRect
      ) {
        const posRelCanvas: Position = getPosRelRect(
          { x: e.clientX, y: e.clientY },
          canvasRect,
        );
        if (
          !outOfBounds(posRelCanvas, canvasRect, graphConfig.circleRadius) &&
          !getNodeAt(
            posRelCanvas,
            graphs.get(currGraph)!.nodes,
            graphConfig.circleRadius,
          )
        ) {
          if (!mouseDownEdgeStationary) {
            nodeActions.handleAddNode({ x: posRelCanvas.x, y: posRelCanvas.y });
          }
        }
      }

      setMouseDownEdgeStationary(null);
      setMouseDownStationary(false);
    },
  };


  useEffect(() => {
    window.addEventListener("mousedown", mouseActions.handleMouseDown);
    window.addEventListener("mousemove", mouseActions.handleMouseMove);
    window.addEventListener("mouseup", mouseActions.handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", mouseActions.handleMouseDown);
      window.removeEventListener("mousemove", mouseActions.handleMouseMove);
      window.removeEventListener("mouseup", mouseActions.handleMouseUp);
    };
  }, [mouseDownStationary, canvasRect, currGraph, shiftPressed, graphPopupActive, graphConfig]);

  // =================================================================
  // ========================== Misc Actions ==========================
  // =================================================================
  const miscActions = {
    // CANCEL ALL ACTIVE DISPLAYS
    handleCancelAllActive: () => {
      miscActions.handleCancelEditing();
      setBoxActive(DEFAULT_BOX_ACTIVE);
      setGraphPopupActive(false);
      setErrorMessage(null);
      algoActions.handleEndAlgorithm();
    },

    // CANCEL ALL ACTIVE DISPLAYS (editing)
    handleCancelEditing: () => {
      setEditingEdge(null);
      setEditingNode(null);
    },

    // CHECK IF BOX IS ACTIVE

  };

  // =================================================================
  // =========================== Algorithms ===========================
  // =================================================================

  const algoActions = {
    // START ALGORITHM
    handleStartAlgo: (type: string) => {
      algoActions.handleEndAlgorithm();
      if (currGraph === "") {
        setErrorMessage("Need to select a graph before running algorithms");
      } else if (graphs.get(currGraph)!.nodes.length <= 1) {
        setErrorMessage("Must have at least two nodes to run an algorithm");
      } else if (type === "toposort") {
        algoActions.handleGetToposort();
      } else if (type === "mst") {
        algoActions.handleGetMST();
      } else {
        setSelectingAlgo({
          ...DEFAULT_SELECTING_ALGO,
          [type]: true,
        });
        setMessage("select origin node...");
      }
    },

    // DETECT CHANGE IN HIGHLIGHTED (SELECTED)
    handleHighlightedChange: () => {
      if (resetShown) return;
      if (selectingAlgo.shortest) {
        if (highlighted.size === 1) {
          setMessage("select destination node...");
        } else if (highlighted.size === 2) {
          algoActions.handleGetShortest();
          setMessage("");
        }
      } else if (selectingAlgo.bfs || selectingAlgo.dfs) {
        if (highlighted.size === 1) {
          setSearchValueInputShown(true);
          setMessage("");
        }
      }
    },

    // SEARCH VALUE SUBMIT
    handleSearchValueSubmit: (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (searchValueInput === "") {
        setErrorMessage("Need to provide a value");
      } else if (selectingAlgo.bfs) {
        algoActions.handleGetTraversal("bfs");
      } else if (selectingAlgo.dfs) {
        algoActions.handleGetTraversal("dfs");
      }
    },

    handleGetToposort: () => {
      try {
        const graph = graphs.get(currGraph)!;
        const ids = algorithmService.toposort(graph);
        algoActions.handleEndAlgorithm();
        graphActions.handleOrderNodes(ids);
        algoActions.displayAnimation(ids, false);
      } catch (err: any) {
        if (typeof err === 'object' && err !== null && 'message' in err && err.message === "Graph contains a cycle") {
          setErrorMessage("No valid topological ordering for this graph");
        } else {
          setErrorMessage(DEFAULT_ERROR);
        }
      }
    },

    // GET TRAVERSAL (BFS/DFS)
    handleGetTraversal: async (type: string) => {
      try {
        const [n1] = highlighted;
        const graph = graphs.get(currGraph)!;
        const ids = type === "bfs"
          ? algorithmService.bfs(n1, searchValueInput, graph, graphConfig.directedMode)
          : algorithmService.dfs(n1, searchValueInput, graph, graphConfig.directedMode);
        algoActions.handleEndAlgorithm();
        algoActions.displayAnimation(ids, true);
      } catch (err: any) {
        algoActions.handleEndAlgorithm();
        setErrorMessage(DEFAULT_ERROR);
      }
    },

    // GET SHORTEST PATH
    handleGetShortest: async () => {
      try {
        const [n1, n2] = highlighted;
        const graph = graphs.get(currGraph)!;
        const ids = algorithmService.shortestPath(n1, n2, graph, graphConfig.directedMode, graphConfig.valuedMode);
        algoActions.handleEndAlgorithm();
        if (ids.length === 0) {
          setErrorMessage("no path exists between these nodes");
        } else {
          algoActions.displayAnimation(ids, true);
        }
      } catch (err: any) {
        algoActions.handleEndAlgorithm();
        setErrorMessage(DEFAULT_ERROR);
      }
    },

    handleGetMST: async () => {
      try {
        const graph = graphs.get(currGraph)!;
        const ids = graphConfig.directedMode
          ? algorithmService.msa(graph, graphConfig.valuedMode)
          : algorithmService.mst(graph, graphConfig.valuedMode);
        algoActions.handleEndAlgorithm();
        algoActions.displayAnimation(ids, true);
      } catch (err: any) {
        if (typeof err === 'object' && err !== null && 'message' in err) {
          if (err.message === "Graph has no edges" || err.message === "Graph is not connected!") {
            setErrorMessage(`Graph has no ${graphConfig.directedMode ? "MSA" : "MST"}`);
          } else {
            setErrorMessage(DEFAULT_ERROR);
          }
        } else {
          setErrorMessage(DEFAULT_ERROR);
        }
      }
    },

    // DISPLAY ANIMATION
    displayAnimation: async (ids: string[], cumulative:boolean) => {
      for (let id of ids) {
        setHighlighted((prev) => new Set(cumulative?[...prev, id]:[id]));
        await new Promise((resolve) => {
          setTimeout(resolve, 400)
        });
      }
      if (!cumulative) {
        setHighlighted(new Set());
      } else {
        setResetShown(true);
      }
    },

    // END ALGORITHM
    handleEndAlgorithm: () => {
      setResetShown(false);
      setMessage("");
      setSelectingAlgo(DEFAULT_SELECTING_ALGO);
      setHighlighted(new Set());
      setSearchValueInputShown(false);
      setSearchValueInput("");
    },
  };


  //focus valueinput
  useEffect(() => {
    if (searchValueInputRef.current && searchValueInputShown) {
      searchValueInputRef.current.focus();
    }
  }, [searchValueInputRef,searchValueInputShown]);

  useEffect(algoActions.handleHighlightedChange, [highlighted]);

  // =================================================================
  // ============================= Saving =============================
  // =================================================================

  const saveActions = {
    handleSaveGraphPNG: () => saveGraphPNG(canvasRef, graphs.get(currGraph)!),
    handleSaveGraphCPP: () => saveGraphCPP(graphs.get(currGraph)!),
  };

  // =================================================================
  // ======================= Returned Component =======================
  // =================================================================

  const [loading, setLoading] = useState(true);
  return (
    <>
      {loading && <div id="loading" />}
      {errorMessage && (
        <Error errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
      )}

      {/* need to add cancel */}
      {message && (
        <TopBox children={message} onClose={algoActions.handleEndAlgorithm} />
      )}
      {resetShown && (
        <TopBox
          children={
            <button
              className="plain-button"
              onClick={algoActions.handleEndAlgorithm}
            >
              reset highlighting
            </button>
          }
          onClose={algoActions.handleEndAlgorithm}
        />
      )}
      {searchValueInputShown && (
        <TopBox
          children={
            <>
              <div id="searching-for">value searching for:</div>
              <form onSubmit={algoActions.handleSearchValueSubmit}>
                <input
                  ref={searchValueInputRef}
                  className="basic-button"
                  type="text"
                  value={searchValueInput}
                  onChange={(e) => setSearchValueInput(e.target.value)}
                />
                <input className="basic-button" type="submit" />
              </form>
            </>
          }
          onClose={algoActions.handleEndAlgorithm}
        />
      )}
      <Header
        unsaved={unsaved}
        authenticated={authenticated}
        authActions={authActions}
        graphs={graphs}
        currGraph={currGraph}
        graphActions={graphActions}
        email={email}
        setBoxActive={setBoxActive}
        graphPopupActive={graphPopupActive}
        setGraphPopupActive={setGraphPopupActive}
        graphSelectPopupRef={graphSelectPopupRef}
        setErrorMessage={setErrorMessage}
        loading={loading}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        saveActions={saveActions}
      />
      <main id="graphpage-main">
        {boxActive.infoBox && (
          <InfoBox
            setBoxActive={setBoxActive}
            setErrorMessage={setErrorMessage}
          />
        )}
        {boxActive.newBlankGraphBox && (
          <NewBlankGraphBox
            setBoxActive={setBoxActive}
            handleNewGraph={graphActions.handleNewGraph}
            setGraphPopupActive={setGraphPopupActive}
            setErrorMessage={setErrorMessage}
          />
        )}
        {boxActive.newTextGraphBox && (
          <NewTextGraphBox
            setBoxActive={setBoxActive}
            setGraphPopupActive={setGraphPopupActive}
            setErrorMessage={setErrorMessage}
            handleNewGraphFromInput={graphActions.handleNewGraphFromInput}
          />
        )}
        {boxActive.queryBox && (
          <QueryBox
            setBoxActive={setBoxActive}
            setErrorMessage={setErrorMessage}
            graph={graphs.get(currGraph)}
          />
        )}
        {boxActive.aiBox && (
          <AiBox
            setBoxActive={setBoxActive}
            handleAddGraph={graphActions.handleAddGraph}
            canvasRect={canvasRect}
            setErrorMessage={setErrorMessage}
          />
        )}
        <Canvas
          graph={currGraph === "" ? null : graphs.get(currGraph)!}
          shiftPressed={shiftPressed}
          setCanvasRect={setCanvasRect}
          canvasRect={canvasRect}
          editingEdge={editingEdge}
          setEditingEdge={setEditingEdge}
          editingNode={editingNode}
          setEditingNode={setEditingNode}
          editInputRef={editInputRef}
          canvasRef={canvasRef}
          setErrorMessage={setErrorMessage}
          graphConfig={graphConfig}
          setGraphs={setGraphs}
          highlighted={highlighted}
          loading={loading}
          darkMode={darkMode}
          edgeActions={edgeActions}
          nodeActions={nodeActions}
          boxActive={boxActive}
          controlPanelRef={controlPanelRef}
          mouseDownEdgeStationary={mouseDownEdgeStationary}
          setMouseDownEdgeStationary={setMouseDownEdgeStationary}
        />
        <Options
          graphConfig={graphConfig}
          setGraphConfig={setGraphConfig}
          darkMode={darkMode}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          handleStartAlgo={algoActions.handleStartAlgo}
          highlightClicking={highlightClicking}
          setHighlightClicking={setHighlightClicking}
        />
      </main>
    </>
  );
}

