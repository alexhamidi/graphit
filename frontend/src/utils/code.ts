import { Graph } from "../interfaces";

export function generateCPP (graph : Graph) : string {

    const n : number = graph.nodes.length;

    let str : string = '';

    let seen : number = 0;

    str += `#include... vector<vector<string>>(${n})

    `;

    let nodeNums : Map<string, number> = new Map();

    graph.nodes.forEach((node) => {
        str += `values[${seen}] = ${node.value}`
        nodeNums.set(node.id, seen);
    })


    graph.edges.forEach((edge) => {
        str += `adj[${nodeNums.get(edge.n1)}].push_back({${nodeNums.get(edge.n2)}, ${edge.value}})`
    })



    return '';

}

