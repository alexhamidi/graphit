package com.graphit.models;

public class NodeEdgeID {

    private String nodeID;
    private String edgeID;

    public NodeEdgeID() {
        this.nodeID = "";
        this.edgeID = "";
    }

    public NodeEdgeID(String nodeID, String edgeID) {
        this.nodeID = nodeID;
        this.edgeID = edgeID;
    }

    public void setNodeID(String nodeID) {
        this.nodeID = nodeID;
    }

    public String getNodeID() {
        return nodeID;
    }

    public void setEdgeID(String edgeID) {
        this.edgeID = edgeID;
    }

    public String getEdgeID() {
        return edgeID;
    }
}
