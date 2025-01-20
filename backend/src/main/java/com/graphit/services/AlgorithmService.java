package com.graphit.services;

import com.graphit.models.Edge;
import com.graphit.models.Graph;
import com.graphit.models.NodeEdgeID;
import com.graphit.models.NumEdge;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
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

    public ArrayList<String> shortestPath(String n1, String n2, Graph graph) { //just need to make pq and predeccessors altedges
        HashMap<String, HashMap<String, NumEdge>> adjList = graph.toNumAdj();

        PriorityQueue<Map.Entry<String, Integer>> pq = new PriorityQueue<>(
            (a, b) -> Integer.compare(a.getValue(), b.getValue())
        );

        HashMap<String, Integer> distances = new HashMap<>();
        HashMap<String, String> predecessors = new HashMap<>();
        // ArrayList<String> edges = new ArrayList<>();

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

    public ArrayList<String> bfs(String origin, String targetValue, Graph graph) {
        HashMap<String, HashMap<String, Edge>> adjList = graph.toAdj();
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
            if (nodeValues.get(nodeID).equals(targetValue)) { //probably
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

    public ArrayList<String> dfs(String origin, String targetValue, Graph graph) {
        HashMap<String, HashMap<String, Edge>> adjList = graph.toAdj();
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
                    s.push(new NodeEdgeID(neighbor, edge.getID())); // Push onto stack for DFS
                }
            }
        }
        return path;
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
    public ArrayList<String> mst(Graph graph) {
        if (graph.getEdges().isEmpty()) throw new IllegalArgumentException();

        HashMap<String, HashMap<String, NumEdge>> adjList = graph.toNumAdj();
        ArrayList<String> path = new ArrayList<>();
        HashSet<String> visited = new HashSet<>();
        HashMap<String, NumEdge> minIncomingEdges = new HashMap<>();
        HashMap<String, String> parent = new HashMap<>();

        // Initialize the minIncomingEdges and parent maps
        for (String node : adjList.keySet()) {
            minIncomingEdges.put(node, null);
            parent.put(node, null);
        }

        // Process each node (excluding the root)
        for (String node : adjList.keySet()) {
            if (!visited.contains(node)) {
                // Find the minimum incoming edge for each node
                for (Map.Entry<String, NumEdge> entry : adjList.get(node).entrySet()) {
                    NumEdge edge = entry.getValue();
                    String u = edge.getN1();
                    if (minIncomingEdges.get(node) == null || edge.getValue() < minIncomingEdges.get(node).getValue()) {
                        minIncomingEdges.put(node, edge);
                        parent.put(node, u);
                    }
                }
            }
        }

        // Add edges to the MST
        for (String node : minIncomingEdges.keySet()) {
            NumEdge edge = minIncomingEdges.get(node);
            if (edge != null) {
                path.add(edge.getID());
                path.add(node);
            }
        }

        // Check if all nodes were visited, which means we formed a spanning tree
        if (path.size() != adjList.size() * 2 - 2) {
            throw new IllegalArgumentException();
        }

        return path;
    }


}
