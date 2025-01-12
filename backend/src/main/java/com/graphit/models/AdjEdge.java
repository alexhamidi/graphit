package com.graphit.models;


public class AdjEdge {

    private Integer value;
    private String id;


    public AdjEdge() {
        this.id = "";
        this.value = 0;
    }

    public AdjEdge(Integer value, String id) {
        this.value = value;
        this.id = id;

    }


    public void setID(String id) {
        this.id = id;
    }

    public String getID() {
        return id;
    }

    public void setValue(Integer value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
