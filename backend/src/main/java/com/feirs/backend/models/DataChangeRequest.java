package com.feirs.backend.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * The approval pipeline ledger — stores proposed updates to restricted
 * "Managed Data" from institutions and holds them in a PENDING state
 * until the Super Admin formally approves or rejects.
 *
 * This table physically prevents any facility from bypassing compliance
 * checks for legally binding data changes.
 *
 * Per Data Change Requests Table Plan.pdf + Database Tables Correction Plan.pdf:
 *   - FK column is institution_id (NOT institution_admin_id)
 *   - proposed_data stores a JSON payload that the backend parses upon approval
 *   - reviewed_by_super_admin_id is Nullable while PENDING, stamped on resolution
 */
@Entity
@Table(name = "data_change_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataChangeRequest {

    /**
     * Unique ticket identifier (e.g., FEIRS-REQ-7742).
     */
    @Id
    @Column(name = "request_id", length = 50, nullable = false, unique = true, updatable = false)
    private String requestId;

    // ── Relational Anchors ───────────────────────────────

    /**
     * Links directly to the institutions table — tells the backend
     * exactly which facility is requesting the change.
     * Column named institution_id per Database Tables Correction Plan.pdf.
     */
    @ManyToOne
    @JoinColumn(name = "institution_id", nullable = false)
    private Institution institution;

    // ── The Proposed Change Data ─────────────────────────

    /**
     * Fixed string representing the type of request.
     * Values: MULTIPLE_UPDATES, INSTITUTION_NAME, OFFICIAL_EMAIL,
     *         ADDRESS, PRIMARY_OFFICER_NAME
     * Set to MULTIPLE_UPDATES when changing several fields at once.
     */
    @Column(name = "update_category", nullable = false, length = 100)
    private String updateCategory;

    /**
     * JSON payload of all changed fields.
     *
     * The React frontend packages all modified fields into a clean JSON string:
     *   {"institution_name": "City General", "official_email": "admin@citygeneral.com"}
     *
     * Upon approval, the Spring Boot backend parses this JSON and updates
     * the respective columns in the institutions table.
     */
    @Column(name = "proposed_data", nullable = false, columnDefinition = "TEXT")
    private String proposedData;

    /**
     * Physically enforces the compliance rule: if an institution changes
     * legal data, they MUST provide new proof. Holds the cloud link to
     * the updated license or letterhead document.
     */
    @Column(name = "new_verification_document_url", nullable = false, columnDefinition = "TEXT")
    private String newVerificationDocumentUrl;

    // ── Approval Workflow Pipeline ───────────────────────

    /**
     * Core state engine of the workflow.
     * PENDING → APPROVED → REJECTED.
     * The Super Admin's dashboard only loads PENDING requests.
     */
    @Builder.Default
    @Column(name = "request_status", nullable = false, length = 50)
    private String requestStatus = "PENDING";

    /**
     * Required explanation when the Super Admin rejects a request.
     * e.g., "The uploaded license does not match the new facility name."
     * Saved here and automatically emailed back to the Institution Admin.
     */
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    /**
     * Ultimate audit trail — stamps the exact Super Admin who authorized
     * or rejected the change. Nullable while PENDING; populated at resolution.
     * Future-proofed for multi-Super-Admin teams — guarantees non-repudiation.
     */
    @ManyToOne
    @JoinColumn(name = "reviewed_by_super_admin_id")
    private SuperAdmin reviewedBySuperAdmin;

    // ── Operational Auditing ─────────────────────────────

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp when the Super Admin clicked approve or reject.
     * Nullable while PENDING; allows SLA metric tracking for approval times.
     */
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // ── JPA Lifecycle Callbacks ──────────────────────────

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
