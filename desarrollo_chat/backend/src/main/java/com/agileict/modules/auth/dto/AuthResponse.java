package com.agileict.modules.auth.dto;

import java.util.Set;
import java.util.UUID;

public record AuthResponse(
        String token,
        UserSummary user
) {
    public record UserSummary(UUID id, String email, Set<String> roles) {
    }
}
