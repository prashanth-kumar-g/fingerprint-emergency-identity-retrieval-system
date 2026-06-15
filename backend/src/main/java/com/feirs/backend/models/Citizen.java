package com.feirs.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * The biometric master record — stores the patient's lifesaving medical profile,
 * demographic data, and encrypted fingerprint templates.
 *
 * Globally accessible during an emergency scan but strictly requires physical
 * biometric authentication to reveal data.
 *
 * Per Citizens Table Plan.pdf + Database Tables Correction Plan.pdf:
 *   - enrolling_institution_id is NOT NULL (overridden per Correction Plan)
 *   - Biometric fields are NEVER wiped — tombstoning prevents collisions
 *   - All PII fields are Nullable so they can be wiped during profile deletion
 */
@Entity
@Table(name = "citizens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Citizen {

    /**
     * Permanent System ID generated upon enrollment (e.g., FEIRS-CIT-40921).
     * Absolute anchor linking to emergency_contacts and audit_logs tables.
     */
    @Id
    @Column(name = "citizen_id", length = 50, nullable = false, unique = true, updatable = false)
    private String citizenId;

    // ── Multi-Tenant Binding ──────────────────────────────

    /**
     * FK to the institution that enrolled this citizen.
     * NOT NULL per Database Tables Correction Plan.pdf — every citizen is
     * permanently tied to the facility that enrolled them via Mantra MFS 110.
     */
    @ManyToOne
    @JoinColumn(name = "enrolling_institution_id", nullable = false)
    private Institution enrollingInstitution;

    // ── Identity & Core Demographics (PII — Nullable for wiping) ──

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 20)
    private String gender;

    // ── Contact & Address (PII — Nullable for wiping) ─────

    @Column(name = "phone_country_code", length = 10)
    private String phoneCountryCode;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email_address", length = 255)
    private String emailAddress;

    @Column(name = "address_line_1", length = 255)
    private String addressLine1;

    @Column(name = "address_line_2", length = 255)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Builder.Default
    @Column(name = "country", nullable = false, length = 100)
    private String country = "India";

    @Column(name = "pin_code", length = 20)
    private String pinCode;

    // ── Critical Medical Profile ──────────────────────────

    /**
     * Most critical data point for trauma emergencies (e.g., "O-").
     */
    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    /**
     * Comma-separated tags (e.g., "Diabetes, Hypertension") that alter
     * how EMTs treat the unconscious victim.
     */
    @Column(name = "chronic_conditions", columnDefinition = "TEXT")
    private String chronicConditions;

    /**
     * High-visibility data (e.g., "Penicillin") to prevent lethal drug
     * interactions in the ambulance.
     */
    @Column(name = "severe_allergies", columnDefinition = "TEXT")
    private String severeAllergies;

    @Column(name = "current_medications", columnDefinition = "TEXT")
    private String currentMedications;

    @Column(name = "medical_documents_url", columnDefinition = "TEXT")
    private String medicalDocumentsUrl;

    // ── Biometric Core — NEVER WIPED ──────────────────────

    /**
     * Cloud link to the webcam photo captured during enrollment.
     * Displayed instantly on the emergency screen for visual identity verification.
     */
    @Column(name = "live_photo_url", columnDefinition = "TEXT")
    private String livePhotoUrl;

    /**
     * Base64 string of the fingerprint BMP image.
     * NOT NULL — permanently retained even after deletion to prevent
     * biometric collisions if the citizen tries to re-enroll.
     */
    @Column(name = "fingerprint_bmp_base64", nullable = false, columnDefinition = "TEXT")
    private String fingerprintBmpBase64;

    /**
     * Encrypted mathematical ISO template string used by the matching algorithm
     * for lightning-fast 1:N identification.
     * NOT NULL — permanently retained for tombstoning collision prevention.
     */
    @Column(name = "fingerprint_iso_template", nullable = false, columnDefinition = "TEXT")
    private String fingerprintIsoTemplate;

    // ── Operational & Compliance ──────────────────────────

    /**
     * Tombstoning switch. ACTIVE → DELETED.
     * When DELETED, all PII fields are wiped but biometric hashes remain.
     * Operators scanning a deleted citizen's finger see a "Profile Reactivation"
     * prompt instead of a new enrollment.
     */
    @Builder.Default
    @Column(name = "account_status", nullable = false, length = 50)
    private String accountStatus = "ACTIVE";

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
