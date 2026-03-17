package com.eventora.service;

import com.eventora.dto.chat.ChatRequest;
import com.eventora.dto.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    // ⭐ later you can inject OpenAI / Gemini / Ollama client here
    // private final AiClient aiClient;

    public ApiResponse<?> chat(
            String message,
            List<ChatRequest.ChatMessage> history,
            String userId
    ) {

        if (message == null || message.isBlank()) {
            return ApiResponse.error("Message cannot be empty");
        }

        // ⭐ fallback safe history
        List<ChatRequest.ChatMessage> safeHistory =
                history != null ? history : Collections.emptyList();

        // ⭐ simple demo AI logic (replace later)
        String reply = generateMockReply(message, safeHistory);

        Map<String, Object> data = new HashMap<>();
        data.put("reply", reply);
        data.put("userId", userId);
        data.put("historySize", safeHistory.size());
        data.put("timestamp", System.currentTimeMillis());

        return ApiResponse.success("Chat response generated", data);
    }

    private String generateMockReply(
            String message,
            List<ChatRequest.ChatMessage> history
    ) {

        String lower = message.toLowerCase();

        if (lower.contains("booking")) {
            return "You can create a booking from the bookings section.";
        }

        if (lower.contains("vendor")) {
            return "You can browse vendors by category and location.";
        }

        if (lower.contains("price")) {
            return "Pricing depends on vendor service package and event details.";
        }

        if (lower.contains("hello") || lower.contains("hi")) {
            return "Hello 👋 How can I help you with your event today?";
        }

        return "Thanks for your message. Our event assistant will guide you soon.";
    }
}