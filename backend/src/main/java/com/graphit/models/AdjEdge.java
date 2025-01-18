package com.graphit.models;


public class AdjEdge {

    private String value;
    private String id;


    public AdjEdge() {
        this.id = "";
        this.value = "";
    }

    public AdjEdge(String value, String id) {
        this.value = value;
        this.id = id;

    }


    public void setID(String id) {
        this.id = id;
    }

    public String getID() {
        return id;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
