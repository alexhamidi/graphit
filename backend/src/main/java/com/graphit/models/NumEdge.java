package com.graphit.models;

public class NumEdge {

    private String id;
    private int value;
    private String n1;
    private String n2;

    public NumEdge() {
        this.id = "";
        this.value = 0;
        this.n1 = "";
        this.n2 = "";
    }

    public NumEdge(String id, int value, String n1, String n2) {
        this.id = id;
        this.value = value;
        this.n1 = n1;
        this.n2 = n2;
    }

    public String getID() {
        return id;
    }

    public void setID(String id) {
        this.id = id;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public String getN1() {
        return n1;
    }

    public void setN1(String n1) {
        this.n1 = n1;
    }

    public String getN2() {
        return n2;
    }

    public void setN2(String n2) {
        this.n2 = n2;
    }
}
