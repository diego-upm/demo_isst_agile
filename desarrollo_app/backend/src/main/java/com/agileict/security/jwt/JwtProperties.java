package com.agileict.security.jwt;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret;
    private long expirationMs;

    public String getSecret() {
        return secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }

    @PostConstruct
    @SuppressWarnings("unused")
    void validate() {
        if (!StringUtils.hasText(secret) || secret.length() < 32 || secret.startsWith("change-this-secret")) {
            throw new IllegalStateException("JWT_SECRET debe configurarse con una clave segura de al menos 32 caracteres.");
        }
    }
}
