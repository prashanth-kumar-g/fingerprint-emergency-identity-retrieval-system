package com.feirs.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Holds incoming institution registrations before approval.
 * Prevents unapproved facilities from clogging the main institutions table.
 */
@Entity
@Table(name = "pending_institution_registrations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingInstitutionRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "registration_id", updatable = false)
    private Long registrationId;

    @Column(name = "institution_name", nullable = false, length = 255)
    private String institutionName;

    @Column(name = "official_email", nullable = false, unique = true, length = 255)
    private String officialEmail;

    @Column(name = "institution_type", nullable = false, length = 100)
    private String institutionType;

    @Column(name = "sector_type", nullable = false, length = 100)
    private String sectorType;

    @Column(name = "primary_officer_name", nullable = false, length = 150)
    private String primaryOfficerName;

    @Column(name = "officer_designation", nullable = false, length = 150)
    private String officerDesignation;

    @Column(name = "phone_country_code", nullable = false, length = 10)
    private String phoneCountryCode;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

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

    @Column(name = "institution_logo_url", columnDefinition = "TEXT")
    private String institutionLogoUrl;

    @Column(name = "verification_document_url", nullable = false, columnDefinition = "TEXT")
    private String verificationDocumentUrl;

    // ── Routing Logic ──────────────────────────────

    /**
     * Regional Routing: Assigned Super Admin based on City/State/Country.
     * If no exact match exists, routes to the Global Super Admin.
     */
    @ManyToOne
    @JoinColumn(name = "routed_super_admin_id")
    private SuperAdmin routedSuperAdmin;

    // ── Status ─────────────────────────────────────

    @Builder.Default
    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING"; // PENDING -> APPROVED / REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
    }
}
