package com.feirs.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * One-to-Many relational table storing emergency contact information for
 * enrolled citizens. Separated from the citizens table to prevent massive
 * empty columns and maintain strict database normalization.
 *
 * Supports 1–10 dynamically added contacts per citizen during enrollment.
 * During an emergency scan, contacts are instantly pulled and alerted.
 *
 * Per Emergency Contacts Table Plan.pdf.
 */
@Entity
@Table(name = "emergency_contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContact {

    /**
     * Unique row identifier (e.g., FEIRS-EC-1092).
     * Every individual contact row needs its own PK for efficient
     * update/delete operations.
     */
    @Id
    @Column(name = "contact_id", length = 50, nullable = false, unique = true, updatable = false)
    private String contactId;

    /**
     * FK linking to the master biometric profile in the citizens table.
     * SELECT * FROM emergency_contacts WHERE citizen_id = 'FEIRS-CIT-40921'
     * instantly pulls all associated family members onto the emergency screen.
     */
    @ManyToOne
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    // ── Contact Details & Demographics ──────────────────

    @Column(name = "contact_name", nullable = false, length = 150)
    private String contactName;

    /**
     * Dropdown selection from enrollment form — tells the EMT exactly
     * who they are calling. Values: Spouse, Parent, Child, Sibling,
     * Legal Guardian, Neighbour, Other.
     */
    @Column(name = "relationship", nullable = false, length = 50)
    private String relationship;

    // ── Atomic Contact Data (Alert Integration) ─────────

    /**
     * International dialing prefix (e.g., "+91"). Separated from the main
     * number so the backend can easily concatenate into E.164 format
     * (e.g., "+919876543210") for SMS/WhatsApp alert APIs.
     */
    @Column(name = "phone_country_code", nullable = false, length = 10)
    private String phoneCountryCode;

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    /**
     * Optional field if the contact prefers to also receive emergency
     * alerts via email.
     */
    @Column(name = "email_address", length = 255)
    private String emailAddress;

    // ── Operational Auditing ─────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── JPA Lifecycle Callbacks ──────────────────────────

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
