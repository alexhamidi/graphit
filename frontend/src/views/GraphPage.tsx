import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useState, useEffect, useCallback, useRef } from "react";
import Canvas from "../components/Canvas";
import Options from "../components/Options";
import AiBox from "../components/AiBox";
import NewGraphBox from "../components/NewGraphBox";
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
} from "../interfaces";
import { authorizedFetch, authorizedPost } from "../networking";
import {
  fetchEmail,
  getNodeAt,
  getPosRelRect,
  outOfBounds,
} from "../utils/utils";
import { debounce } from "lodash";
import {
  DEFAULT_ERROR,
  CLOUD_SAVE_FAIL_ERROR,
  CLOUD_FETCH_FAIL_ERROR,
  DEFAULT_GRAPH_CONFIG,
} from "../constants";

export default function GraphPage({
  setAuthenticated,
  authenticated,
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
  const [aiBoxActive, setAiBoxActive] = useState<boolean>(false);
  const [newGraphBoxActive, setNewGraphBoxActive] = useState<boolean>(false);
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
        return;
      }
      const email: string | null = await fetchEmail(currToken);
      if (!email) {
        setAuthenticated(false);
        localStorage.clear();
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
    // potentially too slow / too much latency
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

  // CREATE AND SAVE EMPTY GRAPH
  const handleNewGraph = (name: string) => {
    const newGraph: Graph = {
      id: uuidv4(),
      name: name,
      nodes: [],
      edges: [],
    };
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
        const response = await authorizedFetch("/api/graphs", token);
        const graphs: Map<string, Graph> = new Map(
          Object.entries(response.data.graphs),
        );
        setGraphs(graphs);
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
      await authorizedPost("/api/graphs", Object.fromEntries(graphs), token);
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
  const handleAddNode = (cursorPos: Position | null) => {
    const newNode: Node = {
      id: uuidv4(),
      value: "0",
      pos: cursorPos || {
        x: Math.random() * (canvasRect?.width ?? 0),
        y: Math.random() * (canvasRect?.height ?? 0),
      },
      customColor: graphConfig.currentChosenColor || "",
    };
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

  // UPDATE NODE COLOR
  const handleChangeNodeColor = (id: string) => {
    if (!graphConfig.currentChosenColor) {
      return;
    }
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      const prevGraph = prevGraphs.get(currGraph)!;
      updatedGraphs.set(currGraph, {
        ...prevGraph,
        nodes: prevGraph.nodes.map((node) =>
          node.id === id
            ? { ...node, customColor: graphConfig.currentChosenColor! }
            : node,
        ),
      });

      return updatedGraphs;
    });
  };

  // UPDATE NODE POSITION
  const handleUpdateNodePos = (id: string, pos: Position) => {
    setGraphs((prevGraphs) => {
      const updatedGraphs = new Map(prevGraphs);
      const prevGraph = prevGraphs.get(currGraph)!;
      updatedGraphs.set(currGraph, {
        ...prevGraph,
        nodes: prevGraph.nodes.map((node) =>
          node.id === id ? { ...node, pos } : node,
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
        edges: prevGraph.edges.map((edge) =>
          edge.id === editNode.id ? { ...edge, value: newValue } : edge,
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
      setAiBoxActive(true);
    } else if (e.key === "i" && metaPressed) {
      setNewGraphBoxActive(true);
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
      !aiBoxActive &&
      !newGraphBoxActive &&
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
    setAiBoxActive(false);
    setNewGraphBoxActive(false);
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

  // =================================================================
  // ======================= Returned Component =======================
  // =================================================================

  return (
    <>
      {errorMessage && (
        <Error errorMessage={errorMessage} setErrorMessage={setErrorMessage} />
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
        setAiBoxActive={setAiBoxActive}
        setNewGraphBoxActive={setNewGraphBoxActive}
        graphPopupActive={graphPopupActive}
        setGraphPopupActive={setGraphPopupActive}
        graphSelectPopupRef={graphSelectPopupRef}
        handleSetError={handleSetError}
      />
      <main id="graphpage-main">
        {newGraphBoxActive && (
          <NewGraphBox
            setNewGraphBoxActive={setNewGraphBoxActive}
            handleNewGraph={handleNewGraph}
            setGraphPopupActive={setGraphPopupActive}
            handleSetError={handleSetError}
          />
        )}
        {aiBoxActive && (
          <AiBox
            setAiBoxActive={setAiBoxActive}
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
          aiBoxActive={aiBoxActive}
          editingEdge={editingEdge}
          setEditingEdge={setEditingEdge}
          editingNode={editingNode}
          setEditingNode={setEditingNode}
          editInputRef={editInputRef}
          handleChangeNodeColor={handleChangeNodeColor}
          canvasRef={canvasRef}
          handleSetError={handleSetError}
          graphConfig={graphConfig}
        />
        <Options
          graphConfig={graphConfig}
          setGraphConfig={setGraphConfig}
          handleSaveGraphPng={handleSaveGraphPng}
        />
      </main>
    </>
  );
}
