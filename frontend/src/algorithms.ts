import { Graph, Edge, Node } from "./interfaces";

interface NumEdge {
    id: string;
    value: number;
    n1: string;
    n2: string;
}

interface NodeEdgeID {
    nodeID: string;
    edgeID: string;
}

interface AdjList {
    [key: string]: {
        [key: string]: Edge;
    };
}

interface NumAdjList {
    [key: string]: {
        [key: string]: NumEdge;
    };
}

export class AlgorithmService {
    shortestPath(n1: string, n2: string, graph: Graph, directed: boolean, valued: boolean): string[] {
        const adjList = this.toNumAdj(graph, directed, valued);
        const pq: Array<[string, number]> = [];
        const distances: Map<string, number> = new Map();
        const predecessors: Map<string, string> = new Map();

        distances.set(n1, 0);
        pq.push([n1, 0]);

        while (pq.length > 0) {
            pq.sort((a, b) => a[1] - b[1]);
            const [u] = pq.shift()!;

            if (u === n2) break;

            if (adjList[u]) {
                for (const [v, edge] of Object.entries(adjList[u])) {
                    const weight = edge.value;
                    const alt = distances.get(u)! + weight;
                    if (!distances.has(v) || alt < distances.get(v)!) {
                        distances.set(v, alt);
                        predecessors.set(v, u);
                        pq.push([v, alt]);
                    }
                }
            }
        }

        if (!distances.has(n2)) return [];

        const path: string[] = [];
        let current = n2;

        while (current != null) {
            path.push(current);
            const prev = predecessors.get(current);
            if (prev && adjList[prev] && adjList[prev][current]) {
                path.push(adjList[prev][current].id);
            }
            current = prev!;
        }

        return path.reverse();
    }

    bfs(origin: string, targetValue: string, graph: Graph, directed: boolean): string[] {
        const adjList = this.toAdj(graph, directed);
        const path: string[] = [];
        const visited = new Set<string>();
        const nodeValues = new Map(graph.nodes.map(node => [node.id, node.value]));

        const q: NodeEdgeID[] = [];
        q.push({ nodeID: origin, edgeID: "" });

        while (q.length > 0) {
            const pair = q.shift()!;
            const { nodeID, edgeID } = pair;

            if (visited.has(nodeID)) continue;

            visited.add(nodeID);
            if (edgeID !== "") path.push(edgeID);
            path.push(nodeID);

            if (nodeValues.get(nodeID) === targetValue) return path;

            if (adjList[nodeID]) {
                for (const [neighbor, edge] of Object.entries(adjList[nodeID])) {
                    if (!visited.has(neighbor)) {
                        q.push({ nodeID: neighbor, edgeID: edge.id });
                    }
                }
            }
        }

        return path;
    }

    dfs(origin: string, targetValue: string, graph: Graph, directed: boolean): string[] {
        const adjList = this.toAdj(graph, directed);
        const path: string[] = [];
        const visited = new Set<string>();
        const nodeValues = new Map(graph.nodes.map(node => [node.id, node.value]));

        const stack: NodeEdgeID[] = [];
        stack.push({ nodeID: origin, edgeID: "" });

        while (stack.length > 0) {
            const pair = stack.pop()!;
            const { nodeID, edgeID } = pair;

            if (visited.has(nodeID)) continue;

            visited.add(nodeID);
            if (edgeID !== "") path.push(edgeID);
            path.push(nodeID);

            if (nodeValues.get(nodeID) === targetValue) return path;

            if (adjList[nodeID]) {
                for (const [neighbor, edge] of Object.entries(adjList[nodeID])) {
                    if (!visited.has(neighbor)) {
                        stack.push({ nodeID: neighbor, edgeID: edge.id });
                    }
                }
            }
        }

        return path;
    }

    mst(graph: Graph, valued: boolean): string[] {
        if (graph.edges.length === 0) throw new Error("Graph has no edges!");

        const adjList = this.toNumAdj(graph, false, valued);
        const path: string[] = [];

        const pq: NumEdge[] = [];
        const visited = new Set<string>();

        const startNode = graph.nodes[0].id;
        visited.add(startNode);
        path.push(startNode);

        for (const edge of Object.values(adjList[startNode] || {})) {
            pq.push(edge);
        }

        while (pq.length > 0) {
            pq.sort((a, b) => a.value - b.value);
            const edge = pq.shift()!;
            const { n1, n2 } = edge;

            const newNode = visited.has(n1) ? n2 : n1;

            if (!visited.has(newNode)) {
                visited.add(newNode);
                path.push(edge.id);
                path.push(newNode);

                for (const newEdge of Object.values(adjList[newNode] || {})) {
                    if (!visited.has(newEdge.n1) || !visited.has(newEdge.n2)) {
                        pq.push(newEdge);
                    }
                }
            }
        }

        if (visited.size !== graph.nodes.length) {
            throw new Error("Graph is not connected!");
        }

        return path;
    }

    msa(graph: Graph, valued: boolean): string[] {
        if (graph.edges.length === 0) throw new Error("Graph has no edges");

        const adjList = this.toNumAdj(graph, true, valued);
        let bestPath: string[] | null = null;
        let bestCost = Infinity;

        for (const startNode of graph.nodes) {
            try {
                const path = this.findMSA(adjList, startNode.id, graph.nodes.length);
                if (this.isValidArborescence(path, adjList, graph.nodes.length)) {
                    const cost = this.calculatePathCost(path, adjList);
                    if (cost < bestCost) {
                        bestCost = cost;
                        bestPath = path;
                    }
                }
            } catch (e) {
                continue;
            }
        }

        if (!bestPath) throw new Error("No valid arborescence found");
        return bestPath;
    }

    private calculatePathCost(path: string[], adjList: NumAdjList): number {
        let cost = 0;
        for (let i = 1; i < path.length; i += 2) {
            const edgeId = path[i];
            const fromNode = path[i - 1];
            const toNode = path[i + 1];

            const edgesFromNode = adjList[fromNode];
            if (edgesFromNode) {
                const edge = edgesFromNode[toNode];
                if (edge) {
                    cost += edge.value;
                }
            }
        }
        return cost;
    }

    private findMSA(adjList: NumAdjList, root: string, totalNodes: number): string[] {
        const path: string[] = [];
        const visited = new Set<string>();
        const incomingEdges = new Map<string, NumEdge>();

        visited.add(root);
        path.push(root);

        for (const node of Object.keys(adjList)) {
            if (node !== root) {
                const minEdge = this.findMinIncomingEdge(adjList, node);
                if (minEdge) {
                    incomingEdges.set(node, minEdge);
                }
            }
        }

        while (visited.size < totalNodes) {
            let nextNode: string | null = null;
            let nextEdge: NumEdge | null = null;

            for (const node of Object.keys(adjList)) {
                if (!visited.has(node) && incomingEdges.has(node)) {
                    const edge = incomingEdges.get(node)!;
                    if (visited.has(edge.n1)) {
                        nextNode = node;
                        nextEdge = edge;
                        break;
                    }
                }
            }

            if (!nextNode || !nextEdge) {
                throw new Error("Cannot reach all nodes from this root");
            }

            visited.add(nextNode);
            path.push(nextEdge.id);
            path.push(nextNode);
        }

        return path;
    }

    private findMinIncomingEdge(adjList: NumAdjList, node: string): NumEdge | null {
        let minEdge: NumEdge | null = null;
        let minValue = Infinity;

        for (const [fromNode, edges] of Object.entries(adjList)) {
            if (edges[node] && edges[node].value < minValue) {
                minValue = edges[node].value;
                minEdge = edges[node];
            }
        }

        return minEdge;
    }

    private isValidArborescence(path: string[], adjList: NumAdjList, totalNodes: number): boolean {
        if (path.length !== totalNodes * 2 - 1) return false;

        const visited = new Set<string>();
        visited.add(path[0]);

        for (let i = 1; i < path.length; i += 2) {
            const toNode = path[i + 1];
            if (visited.has(toNode)) return false;
            visited.add(toNode);
        }

        return visited.size === totalNodes;
    }

    toposort(graph: Graph): string[] {
        const nodeIDs = graph.nodes.map(node => node.id);
        const adjList = this.toBasicAdj(graph);
        const nodeOrdering: string[] = [];
        const visited = new Set<string>();
        const inProgress = new Set<string>();

        for (const node of nodeIDs) {
            if (!visited.has(node)) {
                this.topoDFS(node, adjList, visited, inProgress, nodeOrdering);
            }
        }

        return nodeOrdering.reverse();
    }

    private topoDFS(
        curr: string,
        adjList: { [key: string]: string[] },
        visited: Set<string>,
        inProgress: Set<string>,
        nodeOrdering: string[]
    ): void {
        if (inProgress.has(curr)) {
            throw new Error("Graph contains a cycle");
        }
        if (visited.has(curr)) return;

        inProgress.add(curr);
        for (const neighbor of adjList[curr] || []) {
            this.topoDFS(neighbor, adjList, visited, inProgress, nodeOrdering);
        }
        inProgress.delete(curr);
        visited.add(curr);
        nodeOrdering.push(curr);
    }

    private toAdj(graph: Graph, directed: boolean): AdjList {
        const adjList: AdjList = {};

        for (const node of graph.nodes) {
            adjList[node.id] = {};
        }

        for (const edge of graph.edges) {
            adjList[edge.n1][edge.n2] = edge;
            if (!directed) {
                adjList[edge.n2][edge.n1] = edge;
            }
        }

        return adjList;
    }

    private toNumAdj(graph: Graph, directed: boolean, valued: boolean): NumAdjList {
        const adjList: NumAdjList = {};

        for (const node of graph.nodes) {
            adjList[node.id] = {};
        }

        for (const edge of graph.edges) {
            const numEdge: NumEdge = {
                id: edge.id,
                value: valued ? parseInt(edge.value) || 1 : 1,
                n1: edge.n1,
                n2: edge.n2
            };

            adjList[edge.n1][edge.n2] = numEdge;
            if (!directed) {
                adjList[edge.n2][edge.n1] = numEdge;
            }
        }

        return adjList;
    }

    private toBasicAdj(graph: Graph): { [key: string]: string[] } {
        const adjList: { [key: string]: string[] } = {};

        for (const node of graph.nodes) {
            adjList[node.id] = [];
        }

        for (const edge of graph.edges) {
            adjList[edge.n1].push(edge.n2);
        }

        return adjList;
    }
}
