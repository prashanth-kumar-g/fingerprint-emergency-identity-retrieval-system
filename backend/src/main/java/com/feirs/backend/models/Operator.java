package com.feirs.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Frontline staff table — stores individual employee profiles,
 * manages access to the biometric hardware, and permanently binds
 * each operator to their specific employing institution.
 *
 * Per Operators Table Plan.pdf + Database Tables Correction Plan.pdf:
 * FK column is institution_id (NOT institution_admin_id).
 * Password is Nullable upon creation — the Operator sets it during
 * post-onboarding activation, not the Institution Admin.
 */
@Entity
@Table(name = "operators")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Operator {

    /**
     * Permanent System ID auto-generated when the Institution Admin
     * adds the operator (e.g., FEIRS-OP-90812).
     */
    @Id
    @Column(name = "operator_id", length = 50, nullable = false, unique = true, updatable = false)
    private String operatorId;

    // ── Multi-Tenant Binding ──────────────────────────────

    /**
     * CRITICAL FK — links directly to the institutions table.
     * Enforces Multi-Tenant Architecture: Institution Admin can only
     * view and manage Operators tied to their specific facility.
     *
     * Column named institution_id per Database Tables Correction Plan.pdf
     * (renamed from institution_admin_id).
     */
    @ManyToOne
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    // ── Authentication (Dual Login Core) ──────────────────

    @Column(name = "official_email", nullable = false, unique = true, length = 255)
    private String officialEmail;

    /**
     * Nullable upon creation — the Institution Admin does not set the
     * Operator's password. It populates only when the Operator clicks
     * their email activation link and creates their own password.
     */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    // ── Managed HR Data (Institution Admin Controlled) ────

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "department", nullable = false, length = 100)
    private String department;

    @Column(name = "designation_title", nullable = false, length = 150)
    private String designationTitle;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "gender", nullable = false, length = 20)
    private String gender;

    // ── Self-Service Contact Data (Operator Controlled) ───
    // These are Nullable so the Institution Admin doesn't have to
    // type out the employee's personal address during onboarding.
    // The Operator fills these in themselves after logging in.

    @Column(name = "phone_country_code", length = 10)
    private String phoneCountryCode;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "address_line_1", length = 255)
    private String addressLine1;

    @Column(name = "address_line_2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Builder.Default
    @Column(name = "country", length = 100)
    private String country = "India";

    @Column(name = "pin_code", length = 20)
    private String pinCode;

    @Column(name = "profile_photo_url", columnDefinition = "TEXT")
    private String profilePhotoUrl;

    // ── Operational & Security Workflow ───────────────────

    /**
     * The Institution Admin's staff control switch.
     * Toggling to SUSPENDED instantly revokes login access without
     * hard deletion, preserving all historical emergency scan audit logs.
     */
    @Builder.Default
    @Column(name = "account_status", nullable = false, length = 50)
    private String accountStatus = "ACTIVE";

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── JPA Lifecycle Callbacks ────────────────────────────

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
