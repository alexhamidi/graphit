import { Graph } from "../interfaces";
import { useState, useEffect } from "react";
import Close from "../components/Close";

interface Props {
  handleLogout: () => void;
  handleLogin: () => void;
  authenticated: boolean;
  unsaved: boolean;
  handleNewGraph: (name: string) => void;
  handleDeleteGraph: () => void;
  graphs: Map<string, Graph>;
  setAndCacheCurrGraph: (id: string) => void;
  currGraph: string;
  email: string | null;
  setAiBoxActive: React.Dispatch<React.SetStateAction<boolean>>;
  setNewGraphBoxActive: React.Dispatch<React.SetStateAction<boolean>>;
  graphPopupActive: boolean;
  setGraphPopupActive: React.Dispatch<React.SetStateAction<boolean>>;
  graphSelectPopupRef: React.RefObject<HTMLDivElement>;
  handleSetError: (message: string) => void;
}

export default function Header({
  handleLogout,
  handleLogin,
  authenticated,
  unsaved,
  graphs,
  setAndCacheCurrGraph,
  currGraph,
  handleDeleteGraph,
  email,
  setAiBoxActive,
  setNewGraphBoxActive,
  graphPopupActive,
  setGraphPopupActive,
  graphSelectPopupRef,
}: Props) {
  const [loadingMessage, setLoadingMessage] = useState<string>("saving");

  const handleSelectChange = (id: string) => {
    setAndCacheCurrGraph(id);
    setGraphPopupActive(false);
  };

  const handleDeleteGraphSubmit = () => {
    handleDeleteGraph();
    setGraphPopupActive(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (unsaved) {
      interval = setInterval(() => {
        setLoadingMessage((prev) => {
          if (prev === "saving...") return "saving";
          return prev + ".";
        });
      }, 500);
    }
    return () => {
      clearInterval(interval);
      setLoadingMessage("saving");
    };
  }, [unsaved]);

  return (
    <header id="main-header">
      <div className="header-section">
        <span>{email ? email : "guest"}</span>
        <span>/</span>
        <div ref={graphSelectPopupRef}>
          <button
            id="graph-select"
            className="plain-button"
            onClick={() => setGraphPopupActive((prev) => !prev)}
          >
            <span id="select-text">
              {currGraph === ""
                ? "select a graph"
                : graphs.get(currGraph)!.name}
            </span>
            <i className="fa-solid fa-sort"></i>
          </button>
          {graphPopupActive && (
            <div className="main-component popup" id="graph-popup">
              <Close onClose={() => setGraphPopupActive(false)} />
              <header className="popup-item">graphs</header>
              {graphs.size !== 0 && <hr />}
              {Array.from(graphs.entries()).map(([id, graph]) => (
                <button
                  key={id}
                  className={"plain-button popup-item"}
                  onClick={() => handleSelectChange(graph.id)}
                >
                  {currGraph === id && (
                    <i className="fa-solid fa-check fa-sm"></i>
                  )}
                  {graph.name}
                </button>
              ))}
              <hr />
              {currGraph !== "" && (
                <button
                  className="plain-button popup-item"
                  onClick={handleDeleteGraphSubmit}
                >
                  <i className="fa-solid fa-trash fa-sm"></i>
                  delete the current graph
                </button>
              )}
              <button
                className="plain-button popup-item"
                onClick={() => setNewGraphBoxActive(true)}
              >
                <i className="fa-solid fa-plus fa-sm"></i>
                add new blank graph
              </button>
              <button
                className="plain-button popup-item"
                onClick={() => setAiBoxActive(true)}
              >
                <i className="fa-solid fa-wand-sparkles fa-sm"></i>
                add new graph with ai
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="header-section">
        <p id="savestate">
          {authenticated && (unsaved ? loadingMessage : "saved")}
        </p>
        {authenticated ? (
          <button className="plain-button" onClick={handleLogout}>
            logout
          </button>
        ) : (
          <button className="plain-button" onClick={handleLogin}>
            login
          </button>
        )}
      </div>
    </header>
  );
}
