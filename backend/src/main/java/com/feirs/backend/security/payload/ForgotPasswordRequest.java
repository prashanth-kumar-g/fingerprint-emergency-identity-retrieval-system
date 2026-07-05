package com.feirs.backend.security.payload;

public class ForgotPasswordRequest {
    private String identifier;

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
}
