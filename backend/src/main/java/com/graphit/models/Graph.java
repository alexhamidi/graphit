package com.graphit.models;


import java.util.ArrayList;
import java.util.HashMap;

public class Graph {

    private String id;
    private String name;
    private ArrayList<Node> nodes;
    private ArrayList<Edge> edges;



    public String getId() {
        return id;
    }

    public void setId(String id) {
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
        for (Edge edge : edges) {
            if (!adj.containsKey(edge.getN1())) {
                adj.put(edge.getN1(), new HashMap<String, AdjEdge>());
            }

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

}
