package com.graphit.models;


import java.util.ArrayList;
import java.util.HashMap;

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

    public HashMap<String, HashMap<String, AdjEdge>> toAdj() {
        HashMap<String, HashMap<String, AdjEdge>> adj = new HashMap<String, HashMap<String, AdjEdge>>();
        for (Node node : nodes) {
            adj.put(node.getID(), new HashMap<String, AdjEdge>());
        }
        for (Edge edge : edges) {
            Integer edgeVal = 0;
            try {
                edgeVal = Integer.parseInt(edge.getValue());
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException(e);
            }
            adj.get(edge.getN1()).put(edge.getN2(), new AdjEdge(edgeVal, edge.getID()));
        }
        return adj;
    }

    public HashMap<String, String> getNodeValues() {
        HashMap<String, String> nodeValues = new HashMap<String, String>();
        for (Node node : nodes) {
            nodeValues.put(node.getID(), node.getValue());
        }
        return nodeValues;
    }
}
