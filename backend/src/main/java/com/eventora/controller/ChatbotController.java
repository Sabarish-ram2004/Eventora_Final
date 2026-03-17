package com.eventora.controller;

import com.eventora.dto.chat.ChatRequest;
import com.eventora.dto.common.ApiResponse;
import com.eventora.service.ChatbotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<?>> chat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        String userId =
                userDetails != null
                        ? userDetails.getUsername()
                        : "anonymous";

        return ResponseEntity.ok(
                chatbotService.chat(
                        request.getMessage(),
                        request.getHistory(),
                        userId
                )
        );
    }

    @PostMapping("/public/chat")
    public ResponseEntity<ApiResponse<?>> publicChat(
            @Valid @RequestBody ChatRequest request) {

        return ResponseEntity.ok(
                chatbotService.chat(
                        request.getMessage(),
                        request.getHistory(),
                        "anonymous"
                )
        );
    }
}