package com.graphit.services;

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
import org.springframework.stereotype.Service;
import reactor.core.publisher.FluxSink;

@Service
public class AiService {


    @Value("${spring.ai.openai.prompt.first}")
    private String systemPrompt;

    @Value("${spring.ai.openai.prompt.query}")
    private String queryPrompt;




    private final ChatModel chatModel;
    private final AiUtil aiUtil;

    AiService(ChatModel chatModel, AiUtil aiUtil) {
        this.chatModel = chatModel;
        this.aiUtil = aiUtil;
    }


    public Graph createGraph (String userPrompt, String width, String height) {
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
            return graph;
    }




    public void streamQueryResponse(String userPrompt, Graph graph, String history, FluxSink<String> sink) {
        try {
            OpenAiChatOptions openAiChatOptions = OpenAiChatOptions.builder()
                .withModel("gpt-4o-mini")
                .withTemperature(0.2)
                .withTopP(0.3)
                .build();

            String graphGenerationPrompt = String.format("%s\n==========User Prompt==========\n%s\n==========Graph Data==========\n%s\n==========Conversation History==========\n%s",
                queryPrompt, userPrompt, graph.toString(), history);

                chatModel.stream(new Prompt(graphGenerationPrompt, openAiChatOptions))
                .subscribe(
                    chunk -> {
                        if (chunk != null &&
                            chunk.getResult() != null &&
                            chunk.getResult().getOutput() != null &&
                            chunk.getResult().getOutput().getContent() != null) {

                            String content = chunk.getResult().getOutput().getContent();
                            if (!content.isEmpty()) {
                                sink.next(content);
                            }
                        }
                    },
                    sink::error,
                    sink::complete
                );
        } catch (Exception e) {
            sink.error(e);
        }
    }

}

