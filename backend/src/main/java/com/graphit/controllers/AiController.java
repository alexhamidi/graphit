package com.graphit.controllers;

import com.graphit.models.Graph;
import com.graphit.models.QueryReq;
import com.graphit.services.AiService;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

 @RestController
@RequestMapping("/api/ai")
public class AiController {

    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private final AiService aiService;

    AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody HashMap<String, String> data
    ) {
        try {
            String userPrompt = data.get("prompt");
            String width = data.get("width");
            String height = data.get("height");

            Graph graph = aiService.createGraph(userPrompt, width, height);

            return ResponseEntity.ok(Map.of("graph", graph));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error occurred"));
        }
    }

    @PostMapping(path = "/query", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> query(@RequestBody QueryReq req) {
        return Flux.create(sink -> {
            executorService.submit(() -> {
                try {
                    req.getGraph().setName("");
                    aiService.streamQueryResponse(req.getUserPrompt(),req.getGraph(),  req.getHistory() ,sink);
                } catch (Exception e) {
                    sink.error(e);
                }
            });
        });
    }


}

/*

diff process for local:
- another endpoint hosted on something like sagemaker (?);
-


*/
