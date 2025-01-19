interface Props {
  handleStartAlgo: (type: string) => void;
}

export default function Appearance({ handleStartAlgo }: Props) {
  return (
    <>
      <button
        onClick={() => handleStartAlgo("shortest")}
        className="basic-button"
      >
        Shortest Path
      </button>
      <button onClick={() => handleStartAlgo("bfs")} className="basic-button">
        BFS
      </button>
      <button onClick={() => handleStartAlgo("dfs")} className="basic-button">
        DFS
      </button>
      <button
        onClick={() => handleStartAlgo("toposort")}
        className="basic-button"
      >
        Topological Sort
      </button>
      <button
        onClick={() => handleStartAlgo("mst")}
        className="basic-button"
      >
        MST
      </button>
    </>
  );
}
