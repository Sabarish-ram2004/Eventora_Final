package com.eventora.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final RestTemplate restTemplate;

    @Value("${app.ai-service.url}")
    private String aiServiceUrl;

    @Value("${app.redis.chatbot-ttl}")
    private long chatbotTtl;

    private static final String CACHE_PREFIX = "eventora:chatbot:";

    public Map<String, Object> chat(String message, List<Map<String, String>> history, String userId) {
        String cacheKey = CACHE_PREFIX + hashMessage(message);

        // Check cache for repeated queries
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            log.debug("Chatbot cache HIT for key: {}", cacheKey);
            return Map.of("response", cached, "cached", true, "source", "cache");
        }

        // Try AI microservice
        try {
            Map<String, Object> request = new HashMap<>();
            request.put("message", message);
            request.put("history", history != null ? history : List.of());
            request.put("userId", userId);

            var response = restTemplate.postForEntity(
                    aiServiceUrl + "/chat", request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String aiResponse = (String) response.getBody().get("response");
                redisTemplate.opsForValue().set(cacheKey, aiResponse, chatbotTtl, TimeUnit.SECONDS);
                return Map.of("response", aiResponse, "cached", false, "source", "ai");
            }
        } catch (Exception e) {
            log.warn("AI service unavailable, using fallback: {}", e.getMessage());
        }

        // Fallback rule-based responses
        String fallbackResponse = generateFallbackResponse(message);
        return Map.of("response", fallbackResponse, "cached", false, "source", "fallback");
    }

    private String generateFallbackResponse(String message) {
        String lower = message.toLowerCase();

        if (lower.contains("wedding") || lower.contains("shaadi")) {
            return """
                🎊 **Wedding Planning on Eventora**

                For a complete wedding, you'll typically need:
                • **Hall/Venue** - ₹50,000 to ₹5,00,000
                • **Catering** - ₹800-2,500 per plate
                • **Decoration** - ₹30,000 to ₹3,00,000
                • **Photography** - ₹25,000 to ₹2,00,000
                • **Beautician** - ₹15,000 to ₹80,000
                • **DJ/Music** - ₹15,000 to ₹80,000

                **Total estimated range:** ₹2,00,000 - ₹15,00,000+

                Would you like me to find top-rated vendors near you? 🌟
                """;
        }

        if (lower.contains("budget") || lower.contains("cost") || lower.contains("price")) {
            return """
                💰 **Event Budget Guide**

                Here's a quick breakdown by event size:

                **Small Event (50-100 guests):** ₹1,00,000 - ₹5,00,000
                **Medium Event (100-300 guests):** ₹5,00,000 - ₹20,00,000
                **Large Event (300+ guests):** ₹20,00,000+

                Pro tip: Book vendors 3-6 months in advance for best prices!

                Use our **Budget Calculator** tool for a detailed estimate. 🎯
                """;
        }

        if (lower.contains("hall") || lower.contains("venue")) {
            return """
                🏛️ **Finding the Perfect Venue**

                Key factors to consider:
                • **Capacity** - Ensure it fits all your guests comfortably
                • **Location** - Accessibility for guests
                • **Amenities** - AC, parking, catering kitchen
                • **Price range** - ₹20,000 to ₹5,00,000 per day

                Browse our top-rated halls with AI-powered recommendations! ✨
                """;
        }

        if (lower.contains("catering") || lower.contains("food")) {
            return """
                🍽️ **Catering Services Guide**

                Popular options:
                • **Veg buffet** - ₹600-1,200 per plate
                • **Non-veg buffet** - ₹900-2,000 per plate
                • **Continental** - ₹1,500-3,000 per plate
                • **Live counters** - Additional ₹5,000-15,000

                Tip: Always do a food tasting before finalizing! 😋
                """;
        }

        return """
            👋 **Welcome to Eventora AI Assistant!**

            I can help you with:
            • 📍 Finding vendors near you
            • 💰 Budget planning and estimates
            • 🗓️ Event planning timeline
            • ⭐ Vendor recommendations
            • 📊 Comparing service packages

            What kind of event are you planning? Tell me more! 🎉
            """;
    }

    private String hashMessage(String message) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(message.toLowerCase().trim().getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return message.replaceAll("[^a-zA-Z0-9]", "").substring(0, Math.min(32, message.length()));
        }
    }
}
