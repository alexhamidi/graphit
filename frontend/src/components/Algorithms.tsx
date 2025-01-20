import { GraphConfig } from "../interfaces"

interface Props {
  handleStartAlgo: (type: string) => void;
  graphConfig:GraphConfig;
}

export default function Appearance({ handleStartAlgo, graphConfig }: Props) {
  return (
    <>
      <button
        onClick={() => handleStartAlgo("shortest")}
        className="basic-button"
      >
        Djikstra's
      </button>
      <button onClick={() => handleStartAlgo("bfs")} className="basic-button">
        BFS
      </button>
      <button onClick={() => handleStartAlgo("dfs")} className="basic-button">
        DFS
      </button>
      {graphConfig.directedMode && <button
        onClick={() => handleStartAlgo("toposort")}
        className="basic-button"
      >
        Topological Sort
      </button>}
      <button
        onClick={() => handleStartAlgo("mst")}
        className="basic-button"
      >
        Minimum Spanning {graphConfig.directedMode ? "Arborescence (Edmond's)" : "Tree (Prim's)"}
      </button>
    </>
  );
}
