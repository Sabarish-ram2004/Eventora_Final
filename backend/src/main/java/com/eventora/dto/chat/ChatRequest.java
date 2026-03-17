package com.eventora.dto.chat;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 2000, message = "Message too long")
    private String message;

    @Valid
    @Size(max = 50, message = "History limit exceeded")
    private List<ChatMessage> history;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatMessage {

        @NotBlank(message = "Role is required")
        @Pattern(
                regexp = "user|assistant|system",
                message = "Invalid role"
        )
        private String role;

        @NotBlank(message = "Content cannot be empty")
        @Size(max = 4000, message = "Content too long")
        private String content;
    }
}