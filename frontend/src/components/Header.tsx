import {
  Graph,
  BoxActive,
  GraphActions,
  AuthActions,
  SaveActions,
} from "../interfaces";
import { useState, useEffect } from "react";
import Close from "../components/Close";
import { DEFAULT_BOX_ACTIVE, AI_ACCESSIBLE } from "../constants";

interface Props {
  authActions: AuthActions;
  graphActions: GraphActions;
  authenticated: boolean;
  unsaved: boolean;
  graphs: Map<string, Graph>;
  currGraph: string;
  email: string | null;
  setBoxActive: React.Dispatch<React.SetStateAction<BoxActive>>;
  graphPopupActive: boolean;
  setGraphPopupActive: React.Dispatch<React.SetStateAction<boolean>>;
  graphSelectPopupRef: React.RefObject<HTMLDivElement>;
  setErrorMessage: (message: string) => void;
  loading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  saveActions: SaveActions;
}

export default function Header({
  authActions,
  authenticated,
  graphActions,
  unsaved,
  graphs,
  currGraph,
  email,
  setBoxActive,
  graphPopupActive,
  setGraphPopupActive,
  graphSelectPopupRef,
  loading,
  darkMode,
  toggleDarkMode,
  saveActions,
}: Props) {
  const [loadingMessage, setLoadingMessage] = useState<string>("saving");

  const handleSelectChange = (id: string) => {
    graphActions.setAndCacheCurrGraph(id);
    setGraphPopupActive(false);
  };

  const handleDeleteGraphSubmit = () => {
    graphActions.handleDeleteGraph();
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
            {!loading && (
              <>
                <span id="select-text">
                  {currGraph === ""
                    ? "select a graph"
                    : graphs.get(currGraph)!.name}
                </span>
                <i className="fa-solid fa-sort"></i>
              </>
            )}
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
                <>
                  <button
                    className="plain-button popup-item"
                    onClick={handleDeleteGraphSubmit}
                  >
                    <i className="fa-solid fa-trash fa-sm"></i>
                    delete this graph
                  </button>
                  <button
                    className="plain-button popup-item"
                    onClick={saveActions.handleSaveGraphPNG}
                  >
                    <i className="fa-solid fa-image fa-sm"></i>
                    save this graph (.png)
                  </button>
                  <button
                    className="plain-button popup-item"
                    onClick={saveActions.handleSaveGraphCPP}
                  >
                    <i className="fa-solid fa-code fa-sm"></i>
                    save this graph (.cpp)
                  </button>
                  <button
                    className="plain-button popup-item"
                    onClick={()=>setBoxActive({ ...DEFAULT_BOX_ACTIVE, queryBox: true })}
                  >
                    <i className="fa-solid fa-question fa-sm"></i>
                    query this graph with ai
                  </button>
                </>
              )}

              {currGraph !== "" && <hr />}

              <button
                className="plain-button popup-item"
                onClick={() =>
                  setBoxActive({
                    ...DEFAULT_BOX_ACTIVE,
                    newBlankGraphBox: true,
                  })
                }
              >
                <i className="fa-solid fa-plus fa-sm"></i>
                add new empty graph
              </button>
              <button
                className="plain-button popup-item"
                onClick={() =>
                  setBoxActive({ ...DEFAULT_BOX_ACTIVE, newTextGraphBox: true })
                }
              >
                <i className="fa-solid fa-edit fa-sm"></i>
                add a new graph with text
              </button>
              {false && AI_ACCESSIBLE && (
                <button
                  className="plain-button popup-item"
                  onClick={() =>
                    setBoxActive({ ...DEFAULT_BOX_ACTIVE, aiBox: true })
                  }
                >
                  <i className="fa-solid fa-wand-sparkles fa-sm"></i>
                  add new graph with ai
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div id="middle-icons">
        <a
          href="https://github.com/alexhamidi/graphit"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="icon"
            src={`/assets/github-${darkMode ? "light" : "dark"}.png`}
          ></img>
        </a>
        <button
          className="plain-button"
          onClick={() => setBoxActive({ ...DEFAULT_BOX_ACTIVE, infoBox: true })}
        >
          <img
            className="icon"
            src={`/assets/info-${darkMode ? "light" : "dark"}.png`}
          ></img>
        </button>
        <label className="mode-toggle">
          {darkMode ? (
            <i className="fa-regular fa-sun fa-lg" />
          ) : (
            <i className="fa-solid fa-moon fa-lg" />
          )}
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider"></span>
        </label>
      </div>

      <div className="header-section">
        <p id="savestate">
          {authenticated && (unsaved ? loadingMessage : "saved")}
        </p>
        {/* {authenticated ? (
          <button className="plain-button" onClick={authActions.handleLogout}>
            logout
          </button>
        ) : (
          <button className="plain-button" onClick={authActions.handleLogin}>
            login
          </button>
        )} */}
      </div>
    </header>
  );
}
