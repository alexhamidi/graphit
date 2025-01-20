package com.graphit.controllers;

import com.graphit.models.Graph;
import com.graphit.services.AlgorithmService;
import java.util.ArrayList;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/algorithm")
public class AlgorithmController {

    private AlgorithmService algorithmService;

    public AlgorithmController(AlgorithmService algorithmService) {
        this.algorithmService = algorithmService;
    }

    @PostMapping("/shortest")
    public ResponseEntity<Map<String, Object>> getShortest(
            @RequestParam String n1,
            @RequestParam String n2,
            @RequestParam boolean directed,
            @RequestParam boolean valued,
            @RequestBody Graph graph) {
        try {
            ArrayList<String> visitedIds = algorithmService.shortestPath(n1, n2, graph, directed, valued);

            return ResponseEntity.ok(Map.of("visitedIds", visitedIds));

        } catch (NumberFormatException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", "Invalid request for the given algorithm"));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred")); //actually etting here
        }
    }


    @PostMapping("/bfs")
    public ResponseEntity<Map<String, Object>> getBFS(
            @RequestParam String origin,
            @RequestParam String value,
            @RequestParam boolean directed,
            @RequestBody Graph graph) {
        try {

            ArrayList<String> visitedIds = algorithmService.bfs(origin, value, graph, directed);

            return ResponseEntity.ok(Map.of("visitedIds", visitedIds));

        } catch (NumberFormatException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", "Invalid request for the given algorithm"));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }
    }

    @PostMapping("/dfs")
    public ResponseEntity<Map<String, Object>> getDFS(
            @RequestParam String origin,
            @RequestParam String value,
            @RequestParam boolean directed,
            @RequestBody Graph graph) {
        try {

            ArrayList<String> visitedIds = algorithmService.dfs(origin, value, graph, directed);

            return ResponseEntity.ok(Map.of("visitedIds", visitedIds));

        } catch (NumberFormatException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", "Graph must have numbered edges"));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }
    }


    @PostMapping("/mst")
    public ResponseEntity<Map<String, Object>> getMST( //basically need to return a linked list
            @RequestParam boolean directed,
            @RequestParam boolean valued,
            @RequestBody Graph graph) {

        try {
            ArrayList<String> visitedIds = directed ? algorithmService.msa(graph, valued) : algorithmService.mst(graph, valued);
            return ResponseEntity.ok(Map.of("visitedIds", visitedIds));
        } catch (NumberFormatException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error",  "Graph must have numbered edges"));
        } catch (IllegalArgumentException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", "Graph has no " + (directed ? "MSA" : "MST")));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }
    }




    @PostMapping("/toposort")
    public ResponseEntity<Map<String, Object>> getToposort( //basically need to return a linked list
            @RequestBody Graph graph) {
        try {

            ArrayList<String> orderedIds = algorithmService.toposort(graph); //modifies graph internally
            return ResponseEntity.ok(Map.of("orderedIds", orderedIds));
        } catch (IllegalArgumentException e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of("error", "Graph has no Topological Ordering"));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }
    }

}
