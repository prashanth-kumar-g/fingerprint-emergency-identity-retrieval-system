package com.feirs.backend.institution;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.models.Institution;
import com.feirs.backend.repositories.InstitutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Business logic for the institution lifecycle — registration, profile management,
 * self-service updates, and managed-data change requests.
 *
 * Per Institution Admin Plan.pdf + Rest APIs Plan.pdf Section 3.
 */
@Service
@Transactional
public class InstitutionService {

    private static final Logger log = LoggerFactory.getLogger(InstitutionService.class);
    private static final String ID_PREFIX = "FEIRS-INST";

    private final InstitutionRepository institutionRepository;
    private final DataChangeRequestService changeRequestService;

    public InstitutionService(InstitutionRepository institutionRepository,
                               DataChangeRequestService changeRequestService) {
        this.institutionRepository = institutionRepository;
        this.changeRequestService = changeRequestService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUBLIC — Institution Registration
    //  POST /api/v1/institutions/register
    // ═══════════════════════════════════════════════════════════════

    /**
     * Registers a new institution application.
     *
     * Generates a provisional institution_id immediately (required as PK),
     * sets approval_status to PENDING so the record enters the Super Admin's
     * verification dashboard. The password_hash is left null — per the
     * Institution Admin Plan, passwords are created during the post-approval
     * activation workflow, not at registration.
     *
     * @param institution The fully populated registration form
     * @return The saved institution with generated ID and PENDING status
     * @throws IllegalArgumentException if the official email already exists
     */
    public Institution register(Institution institution) {
        if (institutionRepository.existsByOfficialEmail(institution.getOfficialEmail())) {
            throw new IllegalArgumentException(
                "An institution with this official email is already registered: "
                + institution.getOfficialEmail());
        }

        // Generate provisional system ID
        institution.setInstitutionId(generateInstitutionId());

        // Force PENDING — the Super Admin must manually approve
        institution.setApprovalStatus("PENDING");
        institution.setAccountStatus("ACTIVE");
        institution.setRejectionReason(null);
        institution.setLastLoginAt(null);

        // Password is created during post-approval activation, not now
        institution.setPasswordHash(null);

        Institution saved = institutionRepository.save(institution);
        log.info("✅ Institution registered (PENDING): {} — {}",
                saved.getInstitutionId(), saved.getInstitutionName());
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Profile Retrieval
    //  GET /api/v1/institutions/profile
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Institution getById(String institutionId) {
        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Institution not found: " + institutionId));
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Self-Service Updates
    //  PUT /api/v1/institutions/profile/self-service
    // ═══════════════════════════════════════════════════════════════

    /**
     * Updates fields that the Institution Admin can modify directly without
     * Super Admin approval. Per Institution Admin Plan.pdf, these are:
     *
     *   - phone_country_code & phone_number (general contact number)
     *   - primary_officer_name & officer_designation (HR/administrative details)
     *   - institution_logo_url (branding image)
     *
     * Managed data (institution_name, address fields, official_email) requires
     * a formal Data Change Request via {@link #submitChangeRequest}.
     */
    public Institution updateSelfService(String institutionId, Institution updates) {
        Institution existing = getById(institutionId);

        // Only update self-service fields — ignore managed-data fields
        if (updates.getPhoneCountryCode() != null) {
            existing.setPhoneCountryCode(updates.getPhoneCountryCode());
        }
        if (updates.getPhoneNumber() != null) {
            existing.setPhoneNumber(updates.getPhoneNumber());
        }
        if (updates.getPrimaryOfficerName() != null) {
            existing.setPrimaryOfficerName(updates.getPrimaryOfficerName());
        }
        if (updates.getOfficerDesignation() != null) {
            existing.setOfficerDesignation(updates.getOfficerDesignation());
        }
        if (updates.getInstitutionLogoUrl() != null) {
            existing.setInstitutionLogoUrl(updates.getInstitutionLogoUrl());
        }

        Institution saved = institutionRepository.save(existing);
        log.info("✅ Institution self-service updated: {}", institutionId);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Managed Data Change Request
    //  POST /api/v1/institutions/change-requests
    // ═══════════════════════════════════════════════════════════════

    /**
     * Submits a formal change request for managed (legally binding) data.
     *
     * Per Institution Admin Plan.pdf, managed fields include:
     *   - institution_name, address fields, official_email
     *
     * FULL IMPLEMENTATION BLOCKED on the DataChangeRequest entity (Step 6).
     * Currently logs the request and returns a placeholder response.
     *
     * @param institutionId The requesting institution
     * @param fieldName     The managed field they want to change
     * @param proposedValue The new proposed value
     * @param documentUrl   New verification document supporting the change
     */
    public void submitChangeRequest(String institutionId,
                                     String fieldName,
                                     String proposedValue,
                                     String documentUrl) {
        // Build JSON payload from single field request
        String proposedDataJson = "{\"" + fieldName + "\": \"" + proposedValue + "\"}";
        changeRequestService.submitRequest(
                institutionId, fieldName.toUpperCase(), proposedDataJson, documentUrl);
        log.info("📋 Change request submitted by {} for field: {}", institutionId, fieldName);
    }

    // ═══════════════════════════════════════════════════════════════
    //  SUPER ADMIN — Approval/Rejection (to be wired in Step 2)
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<Institution> getPendingRegistrations() {
        return institutionRepository.findByApprovalStatus("PENDING");
    }

    /**
     * Approves or rejects a pending institution registration.
     * Called by the Super Admin controller.
     */
    public Institution reviewRegistration(String institutionId,
                                           boolean approved,
                                           String rejectionReason) {
        Institution institution = getById(institutionId);

        if (!"PENDING".equals(institution.getApprovalStatus())) {
            throw new IllegalStateException(
                "Institution " + institutionId + " is not in PENDING state. "
                + "Current status: " + institution.getApprovalStatus());
        }

        if (approved) {
            institution.setApprovalStatus("APPROVED");
            institution.setRejectionReason(null);
            log.info("✅ Institution APPROVED: {} — {}. Activation email should be sent.",
                    institutionId, institution.getInstitutionName());
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new IllegalArgumentException(
                    "Rejection reason is required when rejecting an institution.");
            }
            institution.setApprovalStatus("REJECTED");
            institution.setRejectionReason(rejectionReason);
            log.info("❌ Institution REJECTED: {} — Reason: {}",
                    institutionId, rejectionReason);
        }

        return institutionRepository.save(institution);
    }

    // ═══════════════════════════════════════════════════════════════
    //  SUPER ADMIN — Account Status Kill-Switch
    // ═══════════════════════════════════════════════════════════════

    /**
     * Toggles the account_status kill-switch. Flipping to SUSPENDED instantly
     * locks out the Institution Admin and every Operator tied to this facility.
     */
    public Institution setAccountStatus(String institutionId, String newStatus) {
        if (!List.of("ACTIVE", "SUSPENDED").contains(newStatus)) {
            throw new IllegalArgumentException(
                "Invalid account status: " + newStatus + ". Must be ACTIVE or SUSPENDED.");
        }
        Institution institution = getById(institutionId);
        institution.setAccountStatus(newStatus);
        Institution saved = institutionRepository.save(institution);
        log.info("🔒 Institution {} account status set to: {}", institutionId, newStatus);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  QUERY helpers
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<Institution> getApprovedInstitutions() {
        return institutionRepository.findByApprovalStatus("APPROVED");
    }

    // ── ID Generation ─────────────────────────────────────────────

    /**
     * Generates a unique institution_id in the format FEIRS-INST-XXXXXX.
     * Uses the first 6 chars of a UUID for uniqueness without sequential guessing.
     */
    private String generateInstitutionId() {
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return ID_PREFIX + "-" + suffix;
    }
}
