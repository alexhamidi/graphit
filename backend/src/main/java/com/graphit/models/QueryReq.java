package com.graphit.models;

import com.graphit.models.Graph;
public class QueryReq {
    private String userPrompt;
    private Graph graph;

    public QueryReq() {} // Needed for JSON deserialization

    public String getUserPrompt() {
        return userPrompt;
    }

    public void setUserPrompt(String userPrompt) {
        this.userPrompt = userPrompt;
    }

    public Graph getGraph() {
        return graph;
    }

    public void setGraph(Graph graph) {
        this.graph = graph;
    }
}
