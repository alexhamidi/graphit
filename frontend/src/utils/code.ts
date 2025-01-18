import { Graph } from "../interfaces";
import { getAdj } from "./utils";

export function generateCPP(graph: Graph): string {
  const n: number = graph.nodes.length;

  let nodeNums: Map<string, number> = new Map();
  let nodeIds: string[] = [];
  const adjList = getAdj(graph);

  const nodeValues: string = graph.nodes
    .map((node, idx) => {
      nodeIds[idx] = node.id;
      nodeNums.set(node.id, idx);
      return `\t"${node.value}"`;
    })
    .join(",\n");

  const edgeValues: string = nodeIds
    .map((n1) => {
      let edgesForN1 = adjList.get(n1) || [];

      return (
        "\t{" +
        edgesForN1
          .map((edge) => `{${nodeNums.get(edge.n2)}, "${edge.value}"}`)
          .join(", ") +
        "}"
      );
    })
    .join(",\n");

  return `
#include <iostream>

#include <vector>

using namespace std;

int main() {

    // number of nodes
    int n = ${n};

    vector<string> nodeValues = {
${nodeValues}
    };

    // edges[u][i] = {v_i, weight_i}
    vector<vector<pair<int, string>>> edges = {
${edgeValues}
    };

    return 0;
}

`;
}
