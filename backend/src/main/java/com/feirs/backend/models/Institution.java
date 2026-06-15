package com.feirs.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Merged Facility & Institution Admin table.
 * Enforces the strict 1:1 rule — one hospital/police station gets exactly one master login.
 *
 * Per Institutions Table Plan.pdf + Database Tables Correction Plan.pdf:
 * PK renamed from institution_admin_id → institution_id (e.g., FEIRS-INST-MSRIT).
 * approval_status and account_status are kept strictly separate per the correction plan.
 */
@Entity
@Table(name = "institutions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Institution {

    /**
     * Primary Key — manually assigned system ID (e.g., FEIRS-INST-MSRIT).
     * Renamed from institution_admin_id per Database Tables Correction Plan.pdf.
     */
    @Id
    @Column(name = "institution_id", length = 50, nullable = false, unique = true, updatable = false)
    private String institutionId;

    /**
     * Official facility email — unique across the platform, used for Dual Login.
     */
    @Column(name = "official_email", nullable = false, unique = true, length = 255)
    private String officialEmail;

    /**
     * Bcrypt-encrypted password. Nullable during the registration/onboarding phase;
     * set after Super Admin approves the institution.
     */
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    // ── Facility Details ──────────────────────────────────

    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;

    /**
     * e.g., "HOSPITAL", "POLICE_STATION", "CLINIC", "EMERGENCY_SERVICES"
     */
    @Column(name = "institution_type", nullable = false, length = 100)
    private String institutionType;

    /**
     * e.g., "GOVERNMENT", "PRIVATE", "NGO", "MILITARY"
     */
    @Column(name = "sector_type", nullable = false, length = 100)
    private String sectorType;

    // ── Address ────────────────────────────────────────────

    @Column(name = "address_line_1", nullable = false, length = 255)
    private String addressLine1;

    @Column(name = "address_line_2", length = 255)
    private String addressLine2;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", nullable = false, length = 100)
    private String state;

    @Builder.Default
    @Column(name = "country", nullable = false, length = 100)
    private String country = "India";

    @Column(name = "pin_code", nullable = false, length = 20)
    private String pinCode;

    // ── Admin Officer Details ──────────────────────────────

    @Column(name = "primary_officer_name", nullable = false, length = 150)
    private String primaryOfficerName;

    /**
     * e.g., "Medical Superintendent", "Station House Officer", "Chief Administrator"
     */
    @Column(name = "officer_designation", nullable = false, length = 150)
    private String officerDesignation;

    @Column(name = "phone_country_code", nullable = false, length = 10)
    private String phoneCountryCode;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    // ── Document URLs ──────────────────────────────────────

    @Column(name = "institution_logo_url", columnDefinition = "TEXT")
    private String institutionLogoUrl;

    /**
     * Uploaded verification document (e.g., registration certificate, authority letter).
     * Required for Super Admin approval workflow.
     */
    @Column(name = "verification_document_url", nullable = false, columnDefinition = "TEXT")
    private String verificationDocumentUrl;

    // ── Status Columns (SEPARATE per Database Tables Correction Plan.pdf) ──

    /**
     * Controls the Super Admin's verification dashboard.
     * PENDING → APPROVED → REJECTED
     */
    @Builder.Default
    @Column(name = "approval_status", nullable = false, length = 50)
    private String approvalStatus = "PENDING";

    /**
     * Stores the reason when a registration is rejected by Super Admin.
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * Controls login/lifecycle via Spring Security filter chain.
     * ACTIVE → SUSPENDED → DEACTIVATED
     * Kept strictly separate from approval_status per the correction plan.
     */
    @Builder.Default
    @Column(name = "account_status", nullable = false, length = 50)
    private String accountStatus = "ACTIVE";

    // ── Operational Timestamps ─────────────────────────────

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
