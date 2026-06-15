package com.feirs.backend.changerequest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feirs.backend.models.DataChangeRequest;
import com.feirs.backend.models.Institution;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.DataChangeRequestRepository;
import com.feirs.backend.repositories.InstitutionRepository;
import com.feirs.backend.repositories.SuperAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Business logic for the Data Change Request compliance workflow.
 *
 * Handles the submission, review, and resolution of managed-data
 * change requests from Institution Admins.
 *
 * Per Data Change Requests Table Plan.pdf.
 */
@Service
@Transactional
public class DataChangeRequestService {

    private static final Logger log = LoggerFactory.getLogger(DataChangeRequestService.class);
    private static final String ID_PREFIX = "FEIRS-REQ";

    private final DataChangeRequestRepository requestRepository;
    private final InstitutionRepository institutionRepository;
    private final SuperAdminRepository superAdminRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public DataChangeRequestService(DataChangeRequestRepository requestRepository,
                                     InstitutionRepository institutionRepository,
                                     SuperAdminRepository superAdminRepository) {
        this.requestRepository = requestRepository;
        this.institutionRepository = institutionRepository;
        this.superAdminRepository = superAdminRepository;
    }

    // ═════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Submit Change Request
    // ═════════════════════════════════════════════════════════

    /**
     * Creates a new PENDING change request ticket.
     *
     * The proposed_data is stored as a JSON string. The React frontend
     * packages all modified managed-data fields into this JSON payload.
     * Upon approval, the backend parses it and updates the institution.
     *
     * @param institutionId The requesting facility
     * @param updateCategory What type of change (e.g., MULTIPLE_UPDATES)
     * @param proposedDataJson JSON payload of proposed changes
     * @param newDocUrl New verification document supporting the change
     * @return The created request ticket
     */
    public DataChangeRequest submitRequest(String institutionId,
                                            String updateCategory,
                                            String proposedDataJson,
                                            String newDocUrl) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Institution not found: " + institutionId));

        DataChangeRequest request = DataChangeRequest.builder()
                .requestId(generateRequestId())
                .institution(institution)
                .updateCategory(updateCategory.toUpperCase())
                .proposedData(proposedDataJson)
                .newVerificationDocumentUrl(newDocUrl)
                .requestStatus("PENDING")
                .rejectionReason(null)
                .reviewedBySuperAdmin(null)
                .resolvedAt(null)
                .build();

        DataChangeRequest saved = requestRepository.save(request);
        log.info("📋 Change request {} submitted by {} — category: {}",
                saved.getRequestId(), institutionId, updateCategory);
        return saved;
    }

    // ═════════════════════════════════════════════════════════
    //  SUPER ADMIN — Review Dashboard
    // ═════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<DataChangeRequest> getPendingRequests() {
        return requestRepository.findByRequestStatusOrderByCreatedAtDesc("PENDING");
    }

    @Transactional(readOnly = true)
    public DataChangeRequest getById(String requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Change request not found: " + requestId));
    }

    // ═════════════════════════════════════════════════════════
    //  SUPER ADMIN — Resolve (Approve / Reject)
    // ═════════════════════════════════════════════════════════

    /**
     * Approves or rejects a pending change request.
     *
     * If APPROVED:
     *   1. Parses the proposed_data JSON payload
     *   2. Updates the institution's managed-data fields accordingly
     *   3. Stamps reviewed_by_super_admin_id for non-repudiation
     *   4. Records resolved_at for SLA metrics
     *
     * Email Change Rule (per Institution Admin Plan.pdf):
     *   If official_email was changed → send verification link to NEW email.
     *   Database only updates once the Admin clicks that link.
     *   (Email integration pending — currently applies immediately.)
     *
     * If REJECTED:
     *   Saves the rejection reason, notifies the Institution Admin.
     *
     * @param requestId    The ticket to resolve
     * @param approved     true = APPROVED, false = REJECTED
     * @param superAdminId The Super Admin performing the review
     * @param rejectionReason Required if rejected
     */
    @SuppressWarnings("unchecked")
    public DataChangeRequest resolveRequest(String requestId,
                                             boolean approved,
                                             String superAdminId,
                                             String rejectionReason) {
        DataChangeRequest request = getById(requestId);

        if (!"PENDING".equals(request.getRequestStatus())) {
            throw new IllegalStateException(
                "Request " + requestId + " is not in PENDING state. "
                + "Current status: " + request.getRequestStatus());
        }

        SuperAdmin reviewer = superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Super Admin not found: " + superAdminId));

        request.setReviewedBySuperAdmin(reviewer);
        request.setResolvedAt(LocalDateTime.now());

        if (approved) {
            request.setRequestStatus("APPROVED");
            request.setRejectionReason(null);

            // Parse JSON payload and apply changes to the institution
            try {
                Map<String, Object> proposedChanges = mapper.readValue(
                        request.getProposedData(),
                        new TypeReference<Map<String, Object>>() {});

                Institution institution = request.getInstitution();
                applyChanges(institution, proposedChanges, request.getUpdateCategory());
                institutionRepository.save(institution);

                log.info("✅ Change request {} APPROVED — changes applied to institution {}",
                        requestId, institution.getInstitutionId());
            } catch (Exception e) {
                log.error("Failed to apply changes from request {}: {}", requestId, e.getMessage());
                throw new RuntimeException("Failed to parse and apply proposed changes.", e);
            }
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required.");
            }
            request.setRequestStatus("REJECTED");
            request.setRejectionReason(rejectionReason);
            log.info("❌ Change request {} REJECTED — reason: {}", requestId, rejectionReason);
        }

        return requestRepository.save(request);
    }

    // ═════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — View Own Requests
    // ═════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<DataChangeRequest> getRequestsByInstitution(String institutionId) {
        return requestRepository
                .findByInstitution_InstitutionIdOrderByCreatedAtDesc(institutionId);
    }

    // ── Helpers ──────────────────────────────────────────────

    /**
     * Applies the approved JSON changes to the Institution entity.
     * Only updates fields that are present in the JSON payload.
     */
    private void applyChanges(Institution institution,
                               Map<String, Object> changes,
                               String category) {
        if (changes.containsKey("institution_name")) {
            institution.setInstitutionName((String) changes.get("institution_name"));
        }
        if (changes.containsKey("official_email")) {
            institution.setOfficialEmail((String) changes.get("official_email"));
            log.warn("Official email change for {} — verification link should be "
                    + "sent to new email before applying. Currently applying immediately.",
                    institution.getInstitutionId());
        }
        if (changes.containsKey("address_line_1")) {
            institution.setAddressLine1((String) changes.get("address_line_1"));
        }
        if (changes.containsKey("address_line_2")) {
            institution.setAddressLine2((String) changes.get("address_line_2"));
        }
        if (changes.containsKey("city")) {
            institution.setCity((String) changes.get("city"));
        }
        if (changes.containsKey("state")) {
            institution.setState((String) changes.get("state"));
        }
        if (changes.containsKey("country")) {
            institution.setCountry((String) changes.get("country"));
        }
        if (changes.containsKey("pin_code")) {
            institution.setPinCode((String) changes.get("pin_code"));
        }
        if (changes.containsKey("institution_type")) {
            institution.setInstitutionType((String) changes.get("institution_type"));
        }
        if (changes.containsKey("sector_type")) {
            institution.setSectorType((String) changes.get("sector_type"));
        }
        if (changes.containsKey("primary_officer_name")) {
            institution.setPrimaryOfficerName((String) changes.get("primary_officer_name"));
        }
        if (changes.containsKey("officer_designation")) {
            institution.setOfficerDesignation((String) changes.get("officer_designation"));
        }

        log.info("Applied {} field(s) to institution {} [category: {}]",
                changes.size(), institution.getInstitutionId(), category);
    }

    private String generateRequestId() {
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return ID_PREFIX + "-" + suffix;
    }
}
