package com.graphit.services;

import com.graphit.models.Edge;
import com.graphit.models.Graph;
import com.graphit.models.Node;
import com.graphit.models.NodeEdgeID;
import com.graphit.models.NumEdge;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Queue;
import java.util.Stack;
import org.springframework.stereotype.Service;

@Service
public class AlgorithmService {


    public ArrayList<String> shortestPath(String n1, String n2, Graph graph, boolean directed, boolean valued) {
        HashMap<String, HashMap<String, NumEdge>> adjList = graph.toNumAdj(directed, valued); //all 1

        PriorityQueue<Map.Entry<String, Integer>> pq = new PriorityQueue<>(
            (a, b) -> Integer.compare(a.getValue(), b.getValue())
        );

        HashMap<String, Integer> distances = new HashMap<>();
        HashMap<String, String> predecessors = new HashMap<>();

        distances.put(n1, 0);
        pq.add(new AbstractMap.SimpleEntry<>(n1, 0));

        while (!pq.isEmpty()) {
            String u = pq.poll().getKey();

            if (u.equals(n2)) {
                break;
            }

            if (adjList.get(u) != null) {
                for (Map.Entry<String, NumEdge> ent : adjList.get(u).entrySet()) {
                    String v = ent.getKey();
                    NumEdge edge = ent.getValue();
                    int weight = edge.getValue();
                    int alt = distances.get(u) + weight;
                    if (!distances.containsKey(v) || alt < distances.get(v)) {
                        distances.put(v, alt);
                        predecessors.put(v, u);
                        pq.add(new AbstractMap.SimpleEntry<>(v, alt));
                    }
                }
            }
        }

        if (!distances.containsKey(n2)) {
            return new ArrayList<>();
        }

        ArrayList<String> path = new ArrayList<>();
        String current = n2;

        while (current != null) {
            path.add(current);
            String prev = predecessors.get(current);
            if (adjList.containsKey(prev) && adjList.get(prev).containsKey(current)) {
                path.add(adjList.get(prev).get(current).getID());
            }
            current = prev;
        }
        Collections.reverse(path);
        return path;
    }



    public ArrayList<String> bfs(String origin, String targetValue, Graph graph, boolean directed) {
        HashMap<String, HashMap<String, Edge>> adjList = graph.toAdj(directed);
        ArrayList<String> path = new ArrayList<>();
        HashSet<String> visited = new HashSet<>();
        HashMap<String, String> nodeValues = graph.getNodeValues();

        Queue<NodeEdgeID> q = new LinkedList<>();
        q.add(new NodeEdgeID(origin, ""));

        while (!q.isEmpty()) {
            NodeEdgeID pair = q.poll();
            String nodeID = pair.getNodeID();
            String edgeID = pair.getEdgeID();

            if (visited.contains(nodeID)) {
                continue;
            }
            visited.add(nodeID);
            if (!edgeID.isEmpty()) {
                path.add(edgeID);
            }
            path.add(nodeID);
            if (nodeValues.get(nodeID).equals(targetValue)) {
                return path;
            }

            for (Map.Entry<String, Edge> ent : adjList.get(nodeID).entrySet()) { //doesnt work
                String neighbor = ent.getKey();
                Edge edge = ent.getValue();
                if (!visited.contains(neighbor)) {
                    q.add(new NodeEdgeID(neighbor, edge.getID()));
                }
            }
        }
        return path;
    }

    public ArrayList<String> dfs(String origin, String targetValue, Graph graph, boolean directed) {
        HashMap<String, HashMap<String, Edge>> adjList = graph.toAdj(directed);
        ArrayList<String> path = new ArrayList<>();
        HashSet<String> visited = new HashSet<>();
        HashMap<String, String> nodeValues = graph.getNodeValues();

        Stack<NodeEdgeID> s = new Stack<>();
        s.push(new NodeEdgeID(origin, ""));

        while (!s.isEmpty()) {
            NodeEdgeID pair = s.pop();
            String nodeID = pair.getNodeID();
            String edgeID = pair.getEdgeID();

            if (visited.contains(nodeID)) {
                continue;
            }
            visited.add(nodeID);
            if (!edgeID.isEmpty()) {
                path.add(edgeID);
            }
            path.add(nodeID);
            if (nodeValues.get(nodeID).equals(targetValue)) {
                return path;
            }

            for (Map.Entry<String, Edge> ent : adjList.get(nodeID).entrySet()) {
                String neighbor = ent.getKey();
                Edge edge = ent.getValue();
                if (!visited.contains(neighbor)) {
                    s.push(new NodeEdgeID(neighbor, edge.getID()));
                }
            }
        }
        return path;
    }







    public ArrayList<String> mst(Graph graph, boolean valued) {
        if (graph.getEdges().isEmpty()) throw new IllegalArgumentException();

        HashMap<String, HashMap<String, NumEdge>> adjList = graph.toNumAdj(false, valued);
        ArrayList<String> path = new ArrayList<>();

        PriorityQueue<NumEdge> pq = new PriorityQueue<>(Comparator.comparingInt(NumEdge::getValue));
        HashSet<String> visited = new HashSet<>();

        // Start with the first node
        String startNode = graph.getNodes().get(0).getID();
        visited.add(startNode);
        path.add(startNode);

        for (Map.Entry<String, NumEdge> entry : adjList.get(startNode).entrySet()) {
            pq.add(entry.getValue());
        }

        while (!pq.isEmpty()) {
            NumEdge edge = pq.poll();
            String node1 = edge.getN1();
            String node2 = edge.getN2();

            if (visited.contains(node1) && !visited.contains(node2)) {
                visited.add(node2);
                path.add(node2);
                path.add(edge.getID());

                for (Map.Entry<String, NumEdge> entry : adjList.get(node2).entrySet()) {
                    if (!visited.contains(entry.getKey())) {
                        pq.add(entry.getValue());
                    }
                }
            }
            else if (visited.contains(node2) && !visited.contains(node1)) {
                visited.add(node1);
                path.add(node1);
                path.add(edge.getID());

                for (Map.Entry<String, NumEdge> entry : adjList.get(node1).entrySet()) {
                    if (!visited.contains(entry.getKey())) {
                        pq.add(entry.getValue());
                    }
                }
            }
        }

        if (visited.size() != graph.getNodes().size()) {
            throw new IllegalArgumentException();
        }

        return path;
    }

    public ArrayList<String> msa(Graph graph, boolean valued) {
        if (graph.getEdges().isEmpty()) throw new IllegalArgumentException();

        HashMap<String, HashMap<String, NumEdge>> adjList = graph.toNumAdj(true, valued);
        ArrayList<String> bestPath = null;
        int bestCost = Integer.MAX_VALUE;

        // Try each node as potential root
        for (Node startNode : graph.getNodes()) {
            try {
                ArrayList<String> path = findMSA(adjList, startNode.getID(), graph.getNodes().size());
                if (isValidArborescence(path, adjList, graph.getNodes().size())) {
                    int cost = calculatePathCost(path, adjList);
                    if (cost < bestCost) {
                        bestCost = cost;
                        bestPath = path;
                    }
                }
            } catch (IllegalArgumentException e) {
                continue;
            }
        }

        if (bestPath == null) {
            throw new IllegalArgumentException();
        }

        return bestPath;
    }

    private int calculatePathCost(ArrayList<String> path, HashMap<String, HashMap<String, NumEdge>> adjList) {
        int cost = 0;
        for (int i = 1; i < path.size(); i += 2) {
            String edgeId = path.get(i);
            String fromNode = path.get(i - 1);
            String toNode = path.get(i + 1);

            HashMap<String, NumEdge> edgesFromNode = adjList.get(fromNode);
            if (edgesFromNode != null) {
                NumEdge edge = edgesFromNode.get(toNode);
                if (edge != null) {
                    cost += edge.getValue();
                }
            }
        }
        return cost;
    }
    private ArrayList<String> findMSA(HashMap<String, HashMap<String, NumEdge>> adjList, String root, int totalNodes) {
        ArrayList<String> path = new ArrayList<>();
        HashSet<String> visited = new HashSet<>();
        HashMap<String, NumEdge> incomingEdges = new HashMap<>();

        // Initialize with root
        visited.add(root);
        path.add(root);

        // For each non-root node, find the minimum incoming edge
        for (String node : adjList.keySet()) {
            if (!node.equals(root)) {
                NumEdge minEdge = findMinIncomingEdge(adjList, node);
                if (minEdge != null) {
                    incomingEdges.put(node, minEdge);
                }
            }
        }

        // Build the arborescence
        while (visited.size() < totalNodes) {
            String nextNode = null;
            NumEdge nextEdge = null;

            // Find an unvisited node that has an incoming edge from a visited node
            for (String node : adjList.keySet()) {
                if (!visited.contains(node) && incomingEdges.containsKey(node)) {
                    NumEdge edge = incomingEdges.get(node);
                    if (visited.contains(edge.getN1())) {
                        nextNode = node;
                        nextEdge = edge;
                        break;
                    }
                }
            }

            if (nextNode == null) {
                // No valid next node found - this root won't work
                throw new IllegalArgumentException("Cannot reach all nodes from this root");
            }

            visited.add(nextNode);
            path.add(nextEdge.getID());
            path.add(nextNode);
        }

        return path;
    }

    private NumEdge findMinIncomingEdge(HashMap<String, HashMap<String, NumEdge>> adjList, String node) {
        NumEdge minEdge = null;
        int minValue = Integer.MAX_VALUE;

        for (String fromNode : adjList.keySet()) {
            HashMap<String, NumEdge> edges = adjList.get(fromNode);
            if (edges.containsKey(node)) {
                NumEdge edge = edges.get(node);
                if (edge.getValue() < minValue) {
                    minValue = edge.getValue();
                    minEdge = edge;
                }
            }
        }

        return minEdge;
    }

    private boolean isValidArborescence(ArrayList<String> path, HashMap<String, HashMap<String, NumEdge>> adjList, int totalNodes) {
        if (path.size() != totalNodes * 2 - 1) return false; // Should have n nodes and n-1 edges

        HashSet<String> visited = new HashSet<>();
        visited.add(path.get(0)); // Root

        // Check that each edge connects a visited node to an unvisited node
        for (int i = 1; i < path.size(); i += 2) {
            String edgeId = path.get(i);
            String toNode = path.get(i + 1);

            if (visited.contains(toNode)) return false; // No cycles allowed
            visited.add(toNode);
        }

        return visited.size() == totalNodes; // All nodes must be reachable
    }










    public ArrayList<String> toposort(Graph graph) {
        ArrayList<String> nodeIDs = graph.getNodeIDs();
        HashMap<String, ArrayList<String>> adjList = graph.toBasicAdj();
        ArrayList<String> nodeOrdering = new ArrayList<>();
        HashSet<String> visited = new HashSet<>();
        HashSet<String> inProgress = new HashSet<>();

        for (String node : nodeIDs) {
            if (!visited.contains(node)) {
                topoDFS(node, adjList, visited, inProgress, nodeOrdering);
            }
        }

        Collections.reverse(nodeOrdering);
        return nodeOrdering;
        }private void topoDFS(
            String curr,
            HashMap<String, ArrayList<String>> adjList,
            HashSet<String> visited,
            HashSet<String> inProgress,
            ArrayList<String> nodeOrdering
        ) {
        if (inProgress.contains(curr)) {
            throw new IllegalArgumentException("Graph contains a cycle");
        }
        if (visited.contains(curr)) return;

        inProgress.add(curr);
        for (String neighbor : adjList.get(curr)) {
            topoDFS(neighbor, adjList, visited, inProgress, nodeOrdering);
        }
        inProgress.remove(curr);
        visited.add(curr);
        nodeOrdering.add(curr);
    }


}
