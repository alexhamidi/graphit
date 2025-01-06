package com.graphit.models;

import java.util.HashMap;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    @Id
    private String id; // MongoDB ID
    private String email;
    private String password;
    private HashMap<String, Graph> graphs;

    public User() {
    }

    public User(String email, String password, HashMap<String, Graph> graphs) {
        this.email = email;
        this.password = password;
        this.graphs = graphs;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public HashMap<String, Graph> getGraphs() {
        return graphs;
    }

    public void setGraphs(HashMap<String, Graph> graphs) {
        this.graphs = graphs;
    }
}
