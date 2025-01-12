package com.graphit.controllers;

import com.google.gson.Gson;
import com.graphit.models.Graph;
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
@RequestMapping("/api")
public class AiController {

    @Value("${spring.ai.openai.prompt.first}")
    private String systemPrompt;

    // @Value("${spring.ai.openai.model}") //model not working
    // private String model;

    private final ChatModel chatModel;
    private final AiUtil aiUtil;

    AiController(ChatModel chatModel, AiUtil aiUtil) {
        this.chatModel = chatModel;
        this.aiUtil = aiUtil;
    }

    @PostMapping("/ai")
    public ResponseEntity<Map<String, Object>> doPrompt( //should get iiud for graph to avoid intergraph conflict
            @RequestBody HashMap<String, String> data
    ) {
        try {
            String userPrompt = data.get("prompt");
            String width = data.get("width");
            String height = data.get("height");

            OpenAiChatOptions openAiChatOptions = new OpenAiChatOptions();
            openAiChatOptions.setModel("gpt-4o-mini");

            BeanOutputConverter<Graph> converter = new BeanOutputConverter<>(Graph.class);

            String template = """
                {template}
                {format}
                """;

            String graphGenerationPrompt = String.format(systemPrompt, width, height) + userPrompt;
            System.out.println(graphGenerationPrompt);

            PromptTemplate promptTemplate = new PromptTemplate(template, Map.of(
                    "template", new PromptTemplate(graphGenerationPrompt).getTemplate(),
                    "format", converter.getFormat()));

            String result = chatModel.call(new Prompt(promptTemplate.render(new HashMap<>()), openAiChatOptions))
                    .getResult()
                    .getOutput()
                    .getContent();
            Gson gson = new Gson();
            Graph graph = gson.fromJson(result, Graph.class);
            graph.setId(aiUtil.getUuid());

            System.out.println(graph);

            return ResponseEntity.ok(Map.of("graph", graph));
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
