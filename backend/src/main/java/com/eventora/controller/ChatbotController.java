package com.eventora.controller;

import com.eventora.service.ChatbotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatbotController {
    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> chat(@RequestBody Map<String, Object> body,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        String message = (String) body.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) body.get("history");
        String userId = userDetails != null ? userDetails.getUsername() : "anonymous";
        return ResponseEntity.ok(chatbotService.chat(message, history, userId));
    }

    @PostMapping("/public/chat")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> publicChat(@RequestBody Map<String, Object> body) {
        String message = (String) body.get("message");
        List<Map<String, String>> history = (List<Map<String, String>>) body.get("history");
        return ResponseEntity.ok(chatbotService.chat(message, history, "anonymous"));
    }
}
