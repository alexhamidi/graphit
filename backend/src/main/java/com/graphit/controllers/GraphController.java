package com.graphit.controllers;

import com.graphit.models.Graph;
import com.graphit.services.UserService;
import com.graphit.utils.ParseUtil;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class GraphController {

    private UserService userService;
    private ParseUtil parseUtil;

    public GraphController(UserService userService, ParseUtil parseUtil) {
        this.userService = userService;
        this.parseUtil = parseUtil;
    }

    @GetMapping("/graphs")
    public ResponseEntity<Map<String, Object>> getGraphs(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            String email = parseUtil.getEmailFromAuthHeader(authorizationHeader);
            HashMap<String, Graph> graphs = userService.getUserGraphs(email);
            return ResponseEntity.ok(Map.of("graphs", graphs));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Authorization header/token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }
    }

    @PostMapping("/graphs")
    public ResponseEntity<Map<String, Object>> resetGraphs(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody HashMap<String, Graph> graphs) {
        try {
            String email = parseUtil.getEmailFromAuthHeader(authorizationHeader);
            userService.updateUserGraphs(graphs, email);
            HashMap<String, Graph> updatedGraphs = userService.getUserGraphs(email);
            return ResponseEntity.ok(Map.of(
                "message", "Graphs updated successfully",
                "graphs", updatedGraphs
            ));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Authorization header/token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
        }
    }
}
