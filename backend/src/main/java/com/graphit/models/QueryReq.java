package com.graphit.models;

import com.graphit.models.Graph;

public class QueryReq {
    private String userPrompt;
    private Graph graph;
    private String history;  // Renamed conversationID to history

    public QueryReq() {}

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

    public String getHistory() {  // Renamed getter
        return history;
    }

    public void setHistory(String history) {  // Renamed setter
        this.history = history;
    }
}
