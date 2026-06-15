package com.feirs.backend.superadmin;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.institution.InstitutionService;
import com.feirs.backend.models.DataChangeRequest;
import com.feirs.backend.models.Institution;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for Super Admin operations — institution oversight,
 * compliance verification, and the data-change-request resolution pipeline.
 *
 * Per Super Admin Plan.pdf + Rest APIs Plan.pdf Section 2.
 */
@Service
@Transactional
public class SuperAdminService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminService.class);

    private final InstitutionService institutionService;
    private final DataChangeRequestService changeRequestService;

    public SuperAdminService(InstitutionService institutionService,
                              DataChangeRequestService changeRequestService) {
        this.institutionService = institutionService;
        this.changeRequestService = changeRequestService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  GET /api/v1/super-admin/institutions/pending
    // ═══════════════════════════════════════════════════════════════

    /**
     * Returns all institutions awaiting the Super Admin's manual verification.
     * The Super Admin opens each uploaded verification document, confirms
     * legitimacy, and either approves or rejects.
     */
    @Transactional(readOnly = true)
    public List<Institution> getPendingInstitutions() {
        List<Institution> pending = institutionService.getPendingRegistrations();
        log.info("📋 Super Admin fetching pending institutions — count: {}", pending.size());
        return pending;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUT /api/v1/super-admin/institutions/{id}/review
    // ═══════════════════════════════════════════════════════════════

    /**
     * Approves or rejects a pending institution registration.
     *
     * APPROVE: The institution_id becomes the active login identifier.
     *   Backend should send the secure activation email with a link to
     *   the account-setup page (email integration pending).
     *
     * REJECT: The rejection_reason is saved and should be automatically
     *   emailed back to the applicant (email integration pending).
     *
     * @param institutionId   The pending institution to review
     * @param approved        true = APPROVED, false = REJECTED
     * @param rejectionReason Required if rejected; explanation sent to applicant
     * @return The updated institution record
     */
    public Institution reviewInstitution(String institutionId,
                                          boolean approved,
                                          String rejectionReason) {
        Institution reviewed = institutionService.reviewRegistration(
                institutionId, approved, rejectionReason);

        if (approved) {
            log.info("✅ Super Admin APPROVED institution: {} — {}. "
                    + "TODO: Send activation email to {}",
                    institutionId, reviewed.getInstitutionName(),
                    reviewed.getOfficialEmail());
        } else {
            log.info("❌ Super Admin REJECTED institution: {} — Reason: {}. "
                    + "TODO: Send rejection email to {}",
                    institutionId, rejectionReason,
                    reviewed.getOfficialEmail());
        }
        return reviewed;
    }

    // ═══════════════════════════════════════════════════════════════
    //  GET /api/v1/super-admin/change-requests/pending
    // ═══════════════════════════════════════════════════════════════

    /**
     * Returns all pending data change requests from institutions.
     *
     * FULL IMPLEMENTATION BLOCKED on the DataChangeRequest entity (Step 6).
     * Currently returns an empty list.
     */
    @Transactional(readOnly = true)
    public List<DataChangeRequest> getPendingChangeRequests() {
        List<DataChangeRequest> pending = changeRequestService.getPendingRequests();
        log.info("📋 Super Admin fetching pending change requests — count: {}", pending.size());
        return pending;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUT /api/v1/super-admin/change-requests/{id}/resolve
    // ═══════════════════════════════════════════════════════════════

    /**
     * Approves or rejects a pending data change request.
     *
     * If approved AND the request was for an official_email change:
     *   → Send verification link to the NEW email address
     *   → Only update the DB once the Admin clicks that link
     * If approved for any other managed field (name, address):
     *   → Database updates immediately
     *
     * FULL IMPLEMENTATION BLOCKED on DataChangeRequest entity.
     */
    public DataChangeRequest resolveChangeRequest(String requestId,
                                                    boolean approved,
                                                    String superAdminId,
                                                    String rejectionReason) {
        DataChangeRequest resolved = changeRequestService.resolveRequest(
                requestId, approved, superAdminId, rejectionReason);

        if (approved) {
            log.info("✅ Super Admin {} APPROVED change request {} — changes applied to institution {}",
                    superAdminId, requestId, resolved.getInstitution().getInstitutionId());
        } else {
            log.info("❌ Super Admin {} REJECTED change request {} — Reason: {}",
                    superAdminId, requestId, rejectionReason);
        }
        return resolved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUT /api/v1/super-admin/institutions/{id}/status
    // ═══════════════════════════════════════════════════════════════

    /**
     * The platform kill-switch. Toggling an institution's account_status
     * to SUSPENDED instantly locks out the Institution Admin AND every
     * Operator tied to that facility.
     *
     * Per Super Admin Plan.pdf: "Flipping this to SUSPENDED instantly
     * locks out the Admin and every Operator tied to this facility."
     *
     * @param institutionId The target institution
     * @param newStatus     ACTIVE or SUSPENDED
     * @return The updated institution
     */
    public Institution setInstitutionStatus(String institutionId, String newStatus) {
        Institution updated = institutionService.setAccountStatus(institutionId, newStatus);
        log.info("🔒 Super Admin set institution {} account_status to: {}",
                institutionId, newStatus);
        return updated;
    }
}
