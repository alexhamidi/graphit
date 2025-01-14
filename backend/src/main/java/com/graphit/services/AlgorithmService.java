package com.graphit.services;

import com.graphit.models.AdjEdge;
import com.graphit.models.Graph;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.PriorityQueue;
import org.springframework.stereotype.Service;
@Service
public class AlgorithmService {

    public ArrayList<String> shortestPath(String n1, String n2, Graph graph) { //just need to make pq and predeccessors altedges
        HashMap<String, HashMap<String, AdjEdge>> adjList = graph.toAdj();

        PriorityQueue<Map.Entry<String, Integer>> pq = new PriorityQueue<>(
            (a, b) -> Integer.compare(a.getValue(), b.getValue())
        );

        HashMap<String, Integer> distances = new HashMap<>();
        HashMap<String, String> predecessors = new HashMap<>();
        // ArrayList<String> edges = new ArrayList<>();

        distances.put(n1, 0);
        pq.add(new AbstractMap.SimpleEntry<>(n1, 0));

        while (!pq.isEmpty()) {
            String u = pq.poll().getKey();

            if (u.equals(n2)) {
                break;
            }

            if (adjList.get(u) != null) {
                for (Map.Entry<String, AdjEdge> ent : adjList.get(u).entrySet()) {
                    String v = ent.getKey();
                    AdjEdge edge = ent.getValue();
                    int weight = edge.getValue();
                    int alt = distances.get(u) + weight;
                    if (!distances.containsKey(v) || alt < distances.get(v)) {
                        distances.put(v, alt);
                        predecessors.put(v, u);
                        pq.add(new AbstractMap.SimpleEntry<>(v, alt));
                    }
                }
            }
        }


        if (!distances.containsKey(n2)) {
            return new ArrayList<>();
        }

        ArrayList<String> path = new ArrayList<>();
        String current = n2;

        while (current != null) {
            path.add(current);
            String prev = predecessors.get(current);
            if (adjList.containsKey(prev) && adjList.get(prev).containsKey(current)) {
                path.add(adjList.get(prev).get(current).getID());
            }

            current = prev;
        }
        Collections.reverse(path);
        System.out.println(path);
        return path;
    }
}
