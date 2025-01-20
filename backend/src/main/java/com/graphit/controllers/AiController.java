package com.graphit.controllers;

import com.google.gson.Gson;
import com.graphit.models.Graph;
import com.graphit.models.QueryReq;
import com.graphit.utils.AiUtil;
import java.util.HashMap;
import java.util.Map;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

 @RestController
@RequestMapping("/api/ai")
public class AiController {

    @Value("${spring.ai.openai.prompt.first}")
    private String systemPrompt;

    @Value("${spring.ai.openai.prompt.query}")
    private String queryPrompt;

    private final ChatModel chatModel;
    private final AiUtil aiUtil;

    AiController(ChatModel chatModel, AiUtil aiUtil) {
        this.chatModel = chatModel;
        this.aiUtil = aiUtil;
    }

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> create( //should get iiud for graph to avoid intergraph conflict
            @RequestBody HashMap<String, String> data
    ) {
        try {
            String userPrompt = data.get("prompt");
            String width = data.get("width");
            String height = data.get("height");

            OpenAiChatOptions openAiChatOptions = new OpenAiChatOptions();
            openAiChatOptions.setModel("gpt-4o-mini");
            openAiChatOptions.setTemperature(0.2);
            openAiChatOptions.setTopP(0.3);

            BeanOutputConverter<Graph> converter = new BeanOutputConverter<>(Graph.class);

            String template = """
                {template}
                {format}
                """;

            String graphGenerationPrompt = String.format(systemPrompt, width, height) + userPrompt;

            PromptTemplate promptTemplate = new PromptTemplate(template, Map.of(
                    "template", new PromptTemplate(graphGenerationPrompt).getTemplate(),
                    "format", converter.getFormat()));

            String result = chatModel.call(new Prompt(promptTemplate.render(new HashMap<>()), openAiChatOptions))
                    .getResult()
                    .getOutput()
                    .getContent();
            Gson gson = new Gson();
            Graph graph = gson.fromJson(result, Graph.class);
            graph.setID(aiUtil.getUuid());


            return ResponseEntity.ok(Map.of("graph", graph));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error occurred"));
        }
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> query( //should get iiud for graph to avoid intergraph conflict
            @RequestBody QueryReq req
    ) {
        try {

            OpenAiChatOptions openAiChatOptions = new OpenAiChatOptions();
            openAiChatOptions.setModel("gpt-4o-mini");

            String graphGenerationPrompt = String.format("%s\nUser Prompt: %s\nGraph Data: %s",
            queryPrompt, req.getUserPrompt(), req.getGraph().toString());


            String result = "";
            result = chatModel.call(new Prompt(graphGenerationPrompt, openAiChatOptions))
                    .getResult()
                    .getOutput()
                    .getContent();


            return ResponseEntity.ok(Map.of("result", result));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unexpected error occurred"));
        }
    }
}

/*

diff process for local:
- another endpoint hosted on something like sagemaker (?);
-


*/
