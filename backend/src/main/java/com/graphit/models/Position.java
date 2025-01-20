package com.graphit.models;


public class Position {

    private double x;
    private double y;

    public Position() {
        this.x = 0.0;
        this.y = 0.0;
    }

    public Position(double x, double y) {
        this.x = x;
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public void setX(double x) {
        this.x = x;
    }

    public double getY() {
        return y;
    }

    public void setY(double y) {
        this.y = y;
    }
    @Override
public String toString() {
    return "Position{" +
            "x=" + x +
            ", y=" + y +
            '}';
}
}
