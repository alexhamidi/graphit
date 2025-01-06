package com.graphit.models;


public class Node {

    private String id;
    private String value;
    private Position pos;
    private String customColor;

    public Node() {
        this.id = "";
        this.value = "";
        this.pos = new Position();
        this.customColor = "";
    }

    public Node(String id, String value, Position pos, String customColor) {
        this.id = id;
        this.value = value;
        this.pos = pos;
        this.customColor = "";
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public Position getPos() {
        return pos;
    }

    public void setPos(Position pos) {
        this.pos = pos;
    }

    public String getCustomColor() {
        return customColor;
    }

    public void setCustomColor(String customColor) {
        this.customColor = customColor;
    }
}
