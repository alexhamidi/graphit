
interface Props {
  handleStartAlgo: (type:string)=>void,
}

export default function Appearance({
  handleStartAlgo
}: Props) {
  return (
    <>
      <button onClick={()=>handleStartAlgo("shortest")} className="basic-button">
        Run shortest path
      </button>
      <button onClick={()=>handleStartAlgo("bfs")} className="basic-button">
        Run BFS
      </button>
      <button onClick={()=>handleStartAlgo("dfs")} className="basic-button">
        Run DFS
      </button>
      <button onClick={()=>handleStartAlgo("toposort")} className="basic-button">
        Run Topological Sort
      </button>
    </>
  );
}
