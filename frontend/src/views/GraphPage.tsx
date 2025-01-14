import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useCallback, useRef } from "react";
import Canvas from "../components/Canvas";
import Options from "../components/Options";
import AiBox from "../components/AiBox";
import InfoBox from "../components/InfoBox";
import NewBlankGraphBox from "../components/NewBlankGraphBox";
import NewTextGraphBox from "../components/NewTextGraphBox";
import Header from "../components/Header";
import Error from "../components/Error";
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
} from "../interfaces";
import { authorizedFetch, authorizedPost, post } from "../networking";
import {
  fetchEmail,
  getNodeAt,
  getPosRelRect,
  outOfBounds,
  getBoundedPosition,
} from "../utils/utils";
import { generateCPP } from "../utils/code";
import { debounce } from "lodash";
import {
  DEFAULT_ERROR,
  CLOUD_SAVE_FAIL_ERROR,
  CLOUD_FETCH_FAIL_ERROR,
  DEFAULT_GRAPH_CONFIG,
  DEFAULT_BOX_ACTIVE,
  GRAPH_COLORS
} from "../constants";

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

  // KEYS
  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [metaPressed, setMetaPressed] = useState<boolean>(false);

  // MOUSE
  const [mouseDownStationary, setMouseDownStationary] =
    useState<boolean>(false);

  // VISIBILITY
  const [boxActive, setBoxActive] = useState<BoxActive>(DEFAULT_BOX_ACTIVE);
  const [graphPopupActive, setGraphPopupActive] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // REFS
  const editInputRef = useRef<HTMLInputElement>(null);
  const graphSelectPopupRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<SVGSVGElement>(null);

  // OTHER
  const navigate = useNavigate();

  // =================================================================
  // ========================== Auth Actions ==========================
  // =================================================================

  // VALIDATE USER
  useEffect(() => {
    const checkAuth = async () => {
      const currToken = localStorage.getItem("token");
      if (!currToken) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }
      const email: string | null = await fetchEmail(currToken);
      if (!email) {
        handleLogout();
      } else {
        setAuthenticated(true);
        setEmail(email);
        setToken(currToken);
      }
    };
    checkAuth();
  }, [setAuthenticated]);

  // LOGOUT
  const handleLogout = () => {
    setAuthenticated(false);
    setGraphs(new Map()); //need to store everything here
    setCurrGraph("");
    setEmail(null);
    setGraphConfig(DEFAULT_GRAPH_CONFIG);
    localStorage.clear();
  };

  // LOGIN
  const handleLogin = () => {
    localStorage.clear();
    navigate("/login");
  };

  // =================================================================
  // ============================ Caching ============================
  // =================================================================




  //cache all options under one object - store as one object too? would condense stuff

  // CACHE CURRGRAPH
  const setAndCacheCurrGraph = (id: string) => {
    setCurrGraph(id);
    if (authenticated) localStorage.setItem("currGraph", id);
  };

  // CACHE GRAPH OPTIONS
  useEffect(() => {
    if (authenticated)
      localStorage.setItem("graphConfig", JSON.stringify(graphConfig));
  }, [graphConfig]);

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

  // CREATE AND SAVE GRAPH INITIALIZED WITH INPUTS
  const handleNewGraphFromInput = (
    name: string,
    nodeValues: string[],
    edgeValues: MiniEdge[],
  ) => {
    const newGraph: Graph = new Graph(name);
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
        const newEdge: Edge = new Edge(n1Id, n2Id, edgeValue);
        newGraph.edges.push(newEdge);
      }
    });
    handleAddGraph(newGraph);
  };

  // CREATE AND SAVE EMPTY GRAPH
  const handleNewGraph = (name: string) => {
    const newGraph: Graph = new Graph(name);
    handleAddGraph(newGraph);
  };

  // ADD GRAPH
  const handleAddGraph = (graph: Graph) => {
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      updatedGraphs.set(graph.id, graph);
      return updatedGraphs;
    });
    setAndCacheCurrGraph(graph.id);
  };

  // DELETE GRAPH
  const handleDeleteGraph = () => {
    setGraphs((prevGraphs) => {
      const newGraphs = new Map(prevGraphs);
      newGraphs.delete(currGraph);
      return newGraphs;
    });
    localStorage.removeItem("currGraph");
    setCurrGraph("");
  };

  // UPDATE UNSAVED IF CHANGES MADE TO GRAPH
  useEffect(() => {
    if (!unsaved && graphs.size > 0) {
      setUnsaved(true);
    }
  }, [graphs]);

  // FETCH GRAPHS FROM CLOUD
  useEffect(() => {
    const handleFetchGraphs = async () => {
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
        setErrorMessage(CLOUD_FETCH_FAIL_ERROR);
        if (isAxiosError(err) && err.response?.status === 400) {
          handleLogout();
        }
      }
    };
    handleFetchGraphs();
  }, [token, authenticated]);

  // SAVE GRAPH STATE TO CLOUD
  const handleSaveGraphToCloud = async () => {
    if (!authenticated || !token) return;
    try {
      await authorizedPost("/graphs", Object.fromEntries(graphs), token);
    } catch (err) {
      console.error(CLOUD_SAVE_FAIL_ERROR);
      if (isAxiosError(err) && err.response?.status === 400) {
        handleLogout();
      }
    }
  };

  // SAVE GRAPH TO CLOUD REGULARLY
  const debouncedSaveGraph = useCallback(
    debounce(() => {
      //debounce - waits till no changes in 1000ms
      handleSaveGraphToCloud();
      setUnsaved(false);
    }, 1000),
    [handleSaveGraphToCloud],
  );

  useEffect(() => {
    if (authenticated && token) {
      debouncedSaveGraph();
    }
    return () => debouncedSaveGraph.cancel();
  }, [graphs, authenticated, token]);

  // SAVE GRAPH AS PNG
  const handleSaveGraphPng = async () => {
    if (!currGraph) {
      setErrorMessage("Must select a graph first");
      return;
    }
    const svg = canvasRef.current!;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(img, 0, 0);

        const pngDataUrl = canvas.toDataURL("image/png");

        const element = document.createElement("a");
        element.download = `${graphs.get(currGraph)?.name || "graph"}.png`;
        element.href = pngDataUrl;
        element.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // =================================================================
  // ========================== Node Actions ==========================
  // =================================================================

  // ADD NODE
  const handleAddNode = (cursorPos?: Position, newValue?: string) => {
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
  };

  // DELETE NODE
  const handleDeleteNode = (id: string) => {
    handleCancelEditing();
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
  };

  // UPDATE NODE COLOR or do others
  const handleBasicNodeClick = (id: string) => {
    if (selectingShortest) {
      setHighlighted((prev) => new Set(prev).add(id));
      return;
    }
    if (!graphConfig.currentChosenColor) {
      return;
    }
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      const prevGraph = prevGraphs.get(currGraph)!;
      const newColor = graphConfig.currentChosenColor! == GRAPH_COLORS[+darkMode].main ? "": graphConfig.currentChosenColor!
      updatedGraphs.set(currGraph, {
        ...prevGraph,
        nodes: prevGraph.nodes.map((node) =>
          node.id === id
            ? { ...node, customColor: newColor }
            : node,
        ),
      });

      return updatedGraphs;
    });
  };

  //Math.min(Math.max(pos.x, 0), canvasRect!.width)

  // UPDATE NODE POSITION
  const handleUpdateNodePos = (id: string, pos: Position) => {
    //need to min canvasrect
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      const prevGraph = prevGraphs.get(currGraph)!;

      const newPos: Position = getBoundedPosition(pos, canvasRect);

      updatedGraphs.set(currGraph, {
        ...prevGraph,
        nodes: prevGraph.nodes.map((node) =>
          node.id === id ? { ...node, pos: newPos } : node,
        ),
      });
      return updatedGraphs;
    });
  };

  //needs to be fixed

  const handleEditNode = (editNode: Node, newValue: string) => {
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
  };

  const handleEditEdge = (editEdge: Edge, newValue: string) => {
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
  };

  // =================================================================
  // ========================== Edge Actions ==========================
  // =================================================================

  // ADD EDGE
  const handleAddEdge = (n1: string, n2: string) => {
    if (n1 === n2) return;
    const newEdge: Edge = {
      id: uuidv4(),
      value: "0",
      n1: n1,
      n2: n2,
    };
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      const prevGraph = prevGraphs.get(currGraph)!;
      updatedGraphs.set(currGraph, {
        ...prevGraph,
        edges: [...prevGraph.edges, newEdge],
      });
      return updatedGraphs;
    });
  };

  // DELETE EDGE
  const handleDeleteEdge = (id: string) => {
    handleCancelEditing();
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      const prevGraph = prevGraphs.get(currGraph)!;

      updatedGraphs.set(currGraph, {
        ...prevGraph,
        edges: prevGraph.edges.filter((edge) => edge.id !== id),
      });
      return updatedGraphs;
    });
  };

  // =================================================================
  // ========================== Key Handling ==========================
  // =================================================================

  // UPDATE
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      setShiftPressed(true);
    } else if (e.key === "Meta") {
      setMetaPressed(true);
    } else if (e.key === "k" && metaPressed) {
      setBoxActive({ ...DEFAULT_BOX_ACTIVE, aiBox: true });
    } else if (e.key === "i" && metaPressed) {
      setBoxActive({ ...DEFAULT_BOX_ACTIVE, newBlankGraphBox: true });
    } else if (e.key === "u" && metaPressed) {
      setBoxActive({ ...DEFAULT_BOX_ACTIVE, newTextGraphBox: true });
    } else if (e.key == "Escape") {
      handleCancelAllActive();
    }
  };

  const handleKeyUp = () => {
    setShiftPressed(false);
    setMetaPressed(false);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [metaPressed]);

  // =================================================================
  // ========================= Mouse Handling =========================
  // =================================================================

  const handleMouseDown = (e: MouseEvent) => {
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
    }

    if (e.button === 0) {
      setMouseDownStationary(true);
    }
  };

  const handleMouseMove = () => {
    setMouseDownStationary(false);
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (
      !shiftPressed &&
      mouseDownStationary &&
      currGraph !== "" &&
      !editingEdge &&
      !editingNode &&
      !isBoxActive() &&
      canvasRect
    ) {
      const posRelCanvas: Position = getPosRelRect(
        { x: e.clientX, y: e.clientY },
        canvasRect,
      );
      if (
        !outOfBounds(posRelCanvas, canvasRect) &&
        !getNodeAt(
          posRelCanvas,
          graphs.get(currGraph)!.nodes,
          graphConfig.circleRadius,
        )
      ) {
        handleAddNode({ x: posRelCanvas.x, y: posRelCanvas.y });
      }
    }

    setMouseDownStationary(false);
  };
// Prevent pinch-to-zoom on touch devices
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [mouseDownStationary, canvasRect, currGraph, shiftPressed]);

  // =================================================================
  // ========================== Misc Actions ==========================
  // =================================================================

  // CANCEL ALL ACTIVE DISPLAYS
  const handleCancelAllActive = () => {
    setEditingEdge(null);
    setEditingNode(null);
    setBoxActive(DEFAULT_BOX_ACTIVE);
    setGraphPopupActive(false);
    setErrorMessage(null);
  };

  // CANCEL ALL ACTIVE DISPLAYS
  const handleCancelEditing = () => {
    setEditingEdge(null);
    setEditingNode(null);
  };

  // UPDATE ERROR MESSAGE
  const handleSetError = (message?: string) => {
    if (!message) message = DEFAULT_ERROR;
    setErrorMessage(message);
  };

  const isBoxActive = () => {
    return (
      boxActive.aiBox || boxActive.newBlankGraphBox || boxActive.newTextGraphBox
    );
  };

  // should we make a new auxillary function OR usestate on box state
  // easy if convert to single object

  // =================================================================
  // =========================== Algorithms ===========================
  // =================================================================

  const [selectingShortest, setSelectingShortest] = useState<boolean>(false);
  const [highlighted, setHighlighted] = useState<Set<string>>(
    new Set<string>(),
  );
  const [message, setMessage] = useState<string>("");
  const [shortestDisplayed, setShortestDisplayed] = useState<boolean>(false);

  const handleStartShortest = () => {
    handleDisableDisplayed();
    if (currGraph == "") {
      setErrorMessage("Need to select a graph before running algorithms");
      return;
    }
    setSelectingShortest(true);
    setMessage("select origin node...");
  };

  useEffect(() => {
    if (!selectingShortest || shortestDisplayed) return;
    if (highlighted.size === 1) {
      setMessage("select destination node...");
    } else if (highlighted.size === 2) {
      handleGetShortest();
      setMessage("");
    }
  }, [highlighted]);

  const handleGetShortest = async () => {
    if (highlighted.size !== 2) {
      setErrorMessage("Need to select 2 nodes");
      setHighlighted(new Set());
      setSelectingShortest(false);
      return;
    }
    if (!graphs.has(currGraph)) {
      setErrorMessage(DEFAULT_ERROR);
      setHighlighted(new Set());
      setSelectingShortest(false);
      return;
    }
    try {
      const [n1, n2] = highlighted;
      const graph: Graph = graphs.get(currGraph)!;
      const response = await post(
        `/algorithm/shortest?n1=${n1}&n2=${n2}`,
        graph,
      );
      const ids: string[] = response.data.visitedIds;
      console.log(ids)
      if (ids.length === 0) {
        setErrorMessage("no path exists between these nodes");
        setHighlighted(new Set());
      } else {
        setHighlighted(new Set())
        setShortestDisplayed(true);
        let currHighlighted: string[] = [];
        for (let id of ids) {
          currHighlighted = [...currHighlighted, id];
          setHighlighted(new Set(currHighlighted)); //rerunning
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }
      setSelectingShortest(false);
    } catch (err) {
      setHighlighted(new Set());
      setSelectingShortest(false);
      if (isAxiosError(err) && err.response?.status === 400) {
        setErrorMessage("Invalid graph for finding shortest path");
      } else {
        setErrorMessage(DEFAULT_ERROR);
      }
    }
  };

  // =================================================================
  // ============================ Code Gen ============================
  // =================================================================

  const handleDisableDisplayed = () => {
    setShortestDisplayed(false);
    setHighlighted(new Set());
  };

  const handleGenCPP = () => {
    if (currGraph == "") {
      setErrorMessage("Need to select a graph before generating code");
      return;
    }

    const cpp: string = generateCPP(graphs.get(currGraph)!);

    const blob = new Blob([cpp], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const element = document.createElement("a");
    element.download = `${graphs.get(currGraph)!.name}.cpp`;
    element.href = url;
    element.click();

    URL.revokeObjectURL(url);
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
      {(message || shortestDisplayed) && (
        <div id="message" className="main-component">
          {message && message}
          {shortestDisplayed && (
            <button className="plain-button" onClick={handleDisableDisplayed}>
              reset highlighting
            </button>
          )}
        </div>
      )}
      <Header
        unsaved={unsaved}
        authenticated={authenticated}
        handleLogout={handleLogout}
        handleLogin={handleLogin}
        graphs={graphs}
        currGraph={currGraph}
        setAndCacheCurrGraph={setAndCacheCurrGraph}
        handleNewGraph={handleNewGraph}
        handleDeleteGraph={handleDeleteGraph}
        email={email}
        setBoxActive={setBoxActive}
        graphPopupActive={graphPopupActive}
        setGraphPopupActive={setGraphPopupActive}
        graphSelectPopupRef={graphSelectPopupRef}
        handleSetError={handleSetError}
        loading={loading}
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
      />
      <main id="graphpage-main">
        {boxActive.infoBox && (
          <InfoBox
            setBoxActive={setBoxActive}
            handleSetError={handleSetError}
          />
        )}
        {boxActive.newBlankGraphBox && (
          <NewBlankGraphBox
            setBoxActive={setBoxActive}
            handleNewGraph={handleNewGraph}
            setGraphPopupActive={setGraphPopupActive}
            handleSetError={handleSetError}
          />
        )}
        {boxActive.newTextGraphBox && (
          <NewTextGraphBox
            setBoxActive={setBoxActive}
            setGraphPopupActive={setGraphPopupActive}
            handleSetError={handleSetError}
            handleNewGraphFromInput={handleNewGraphFromInput}
          />
        )}
        {boxActive.aiBox && (
          <AiBox
            setBoxActive={setBoxActive}
            handleAddGraph={handleAddGraph}
            canvasRect={canvasRect}
            handleSetError={handleSetError}
          />
        )}
        <Canvas
          graph={currGraph === "" ? null : graphs.get(currGraph)!}
          handleAddEdge={handleAddEdge}
          handleDeleteNode={handleDeleteNode}
          handleUpdateNodePos={handleUpdateNodePos}
          handleDeleteEdge={handleDeleteEdge}
          shiftPressed={shiftPressed}
          setCanvasRect={setCanvasRect}
          canvasRect={canvasRect}
          handleEditNode={handleEditNode}
          handleEditEdge={handleEditEdge}
          isBoxActive={isBoxActive}
          editingEdge={editingEdge}
          setEditingEdge={setEditingEdge}
          editingNode={editingNode}
          setEditingNode={setEditingNode}
          editInputRef={editInputRef}
          handleBasicNodeClick={handleBasicNodeClick}
          canvasRef={canvasRef}
          handleSetError={handleSetError}
          graphConfig={graphConfig}
          setGraphs={setGraphs}
          highlighted={highlighted}
          loading={loading}
          darkMode={darkMode}
        />
        <Options
          graphConfig={graphConfig}
          setGraphConfig={setGraphConfig}
          handleSaveGraphPng={handleSaveGraphPng}
          handleStartShortest={handleStartShortest}
          handleGenCPP={handleGenCPP}
          darkMode={darkMode}
        />
      </main>
    </>
  );
}
