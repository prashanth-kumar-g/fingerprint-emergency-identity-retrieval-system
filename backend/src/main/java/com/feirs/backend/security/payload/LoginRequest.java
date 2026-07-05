package com.feirs.backend.security.payload;

public class LoginRequest {
    private String identifier;
    private String password;
    private String role; // "super-admin", "institution", "operator"

    // Getters and Setters
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
