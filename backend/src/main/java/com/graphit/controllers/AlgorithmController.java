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
    public ResponseEntity<Map<String, Object>> resetGraphs(
            @RequestParam String n1,
            @RequestParam String n2,
            @RequestBody Graph graph) {
        try {
            ArrayList<String> visitedIds = algorithmService.shortestPath(n1, n2, graph);

            return ResponseEntity.ok(Map.of("visitedIds", visitedIds));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Invalid request for the given algorithm"));
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred")); //actually etting here
        }
    }
}
