package com.graphit.utils;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AiUtil {
    public String getUuid() {
        return UUID.randomUUID().toString();
    }
}
