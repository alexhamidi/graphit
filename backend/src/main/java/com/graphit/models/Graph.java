package com.graphit.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.stream.Collectors;

public class Graph {

    private String id;
    private String name;
    private ArrayList<Node> nodes;
    private ArrayList<Edge> edges;

    public String getID() {
        return id;
    }

    public void setID(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ArrayList<Node> getNodes() {
        return nodes;
    }

    public void setNodes(ArrayList<Node> nodes) {
        this.nodes = nodes;
    }

    public ArrayList<Edge> getEdges() {
        return edges;
    }

    public void setEdges(ArrayList<Edge> edges) {
        this.edges = edges;
    }

    public HashMap<String, HashMap<String, Edge>> toAdj(boolean directed) {
        HashMap<String, HashMap<String, Edge>> adj = new HashMap<>();
        for (Node node : nodes) {
            adj.put(node.getID(), new HashMap<>());
        }
        for (Edge edge : edges) {
            adj.get(edge.getN1()).put(edge.getN2(), edge);
            if (!directed) adj.get(edge.getN2()).put(edge.getN1(), edge);
        }
        return adj;
    }

    public HashMap<String, HashMap<String, NumEdge>> toNumAdj(boolean directed, boolean valued) {
        HashMap<String, HashMap<String, NumEdge>> adj = new HashMap<>();
        for (Node node : nodes) {
            adj.put(node.getID(), new HashMap<>());
        }
        for (Edge edge : edges) {
            int edgeVal = 1;
            if (valued) {
                try {
                    edgeVal = Integer.parseInt(edge.getValue());
                } catch (NumberFormatException e) {
                    throw e;
                }
            }
            adj.get(edge.getN1()).put(edge.getN2(), new NumEdge(edge.getID(), edgeVal, edge.getN1(), edge.getN2()));
            if (!directed) adj.get(edge.getN2()).put(edge.getN1(), new NumEdge(edge.getID(), edgeVal, edge.getN1(), edge.getN2()));
        }
        return adj;
    }

    public HashMap<String, ArrayList<String>> toBasicAdj() {//bool bidirectinoal
        HashMap<String, ArrayList<String>> adj = new HashMap<>();
        for (Node node : nodes) {
            adj.put(node.getID(), new ArrayList<>());
        }
        for (Edge edge : edges) {
            adj.get(edge.getN1()).add(edge.getN2());
        }
        return adj;
    }

    public HashMap<String, String> getNodeValues() {
        HashMap<String, String> nodeValues = new HashMap<>();
        for (Node node : nodes) {
            nodeValues.put(node.getID(), node.getValue());
        }
        return nodeValues;
    }

    public ArrayList<String> getNodeIDs() {
        ArrayList<String> nodeIDs = new ArrayList<>();
        for (Node node : nodes) {
            nodeIDs.add(node.getID());
        }
        return nodeIDs;
    }

    @Override
    public String toString() {
        return "Graph{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", nodes=[" + nodes.stream().map(Node::toString).collect(Collectors.joining(", ")) + "]" +
                ", edges=[" + edges.stream().map(Edge::toString).collect(Collectors.joining(", ")) + "]" +
                '}';
    }
}
