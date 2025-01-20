package com.graphit.models;

public class Edge {

    private String id;
    private String value;
    private String n1;
    private String n2;

    public Edge() {
        this.id = "";
        this.value = "";
        this.n1 = "";
        this.n2 = "";
    }

    public Edge(String id, String value, String n1, String n2) {
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

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
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

    @Override
public String toString() {
    return "Edge{" +
            "id='" + id + '\'' +
            ", value='" + value + '\'' +
            ", n1='" + n1 + '\'' +
            ", n2='" + n2 + '\'' +
            '}';
}

}
