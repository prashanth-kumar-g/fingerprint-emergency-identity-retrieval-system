package com.feirs.backend.institution;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.models.DataChangeRequest;
import com.feirs.backend.models.Institution;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Institution lifecycle management.
 *
 * Per Rest APIs Plan.pdf Section 3 — Institution Management:
 *   POST   /api/v1/institutions/register              — PUBLIC
 *   GET    /api/v1/institutions/profile               — INST_ADMIN
 *   PUT    /api/v1/institutions/profile/self-service   — INST_ADMIN
 *   POST   /api/v1/institutions/change-requests        — INST_ADMIN
 *
 * Note: institutionId is currently passed as a query parameter.
 * This will switch to JWT extraction when Spring Security RBAC is built (Step 3).
 */
@RestController
@RequestMapping("/api/v1/institutions")
@CrossOrigin(origins = "*")
public class InstitutionController {

    private static final Logger log = LoggerFactory.getLogger(InstitutionController.class);

    private final InstitutionService institutionService;
    private final DataChangeRequestService changeRequestService;

    public InstitutionController(InstitutionService institutionService,
                                  DataChangeRequestService changeRequestService) {
        this.institutionService = institutionService;
        this.changeRequestService = changeRequestService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUBLIC — Institution Registration
    //  POST /api/v1/institutions/register
    // ═══════════════════════════════════════════════════════════════

    /**
     * Public registration endpoint. Any unauthenticated institution can submit
     * their facility details and verification documents. The record enters the
     * Super Admin's approval queue with approval_status=PENDING.
     *
     * Request body: All required Institution fields (see Institution entity).
     * Response:     201 Created with the saved institution (includes generated ID).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Institution institution) {
        try {
            Institution saved = institutionService.register(institution);
            log.info("📝 New institution registration: {} — {}",
                    saved.getInstitutionId(), saved.getInstitutionName());
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Registration submitted successfully. Awaiting Super Admin approval.",
                "institutionId", saved.getInstitutionId(),
                "approvalStatus", saved.getApprovalStatus()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error during registration."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — View Profile
    //  GET /api/v1/institutions/profile?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    /**
     * Retrieves the institution's own full profile.
     * Role: INSTITUTION_ADMIN.
     *
     * TODO: Extract institutionId from JWT token instead of query param.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String institutionId) {
        try {
            Institution institution = institutionService.getById(institutionId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "institution", institution
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Self-Service Update
    //  PUT /api/v1/institutions/profile/self-service?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    /**
     * Updates non-managed fields that the Institution Admin can modify directly.
     *
     * Allowed fields (per Institution Admin Plan.pdf):
     *   - phoneCountryCode, phoneNumber (general contact)
     *   - primaryOfficerName, officerDesignation (HR details)
     *   - institutionLogoUrl (branding image)
     *
     * Managed fields (name, address, email) are NOT updated here —
     * they require a formal Data Change Request via /change-requests.
     */
    @PutMapping("/profile/self-service")
    public ResponseEntity<?> updateSelfService(@RequestParam String institutionId,
                                                @RequestBody Institution updates) {
        try {
            Institution updated = institutionService.updateSelfService(institutionId, updates);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully.",
                "institution", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Self-service update error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error during profile update."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Submit Managed Data Change Request
    //  POST /api/v1/institutions/change-requests?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    /**
     * Submits a formal request to change legally binding (managed) data.
     *
     * Managed fields (per Institution Admin Plan.pdf):
     *   - institution_name, address fields, official_email
     *
     * The change is NOT applied immediately. It enters the Data Change Request
     * queue for Super Admin review and requires a new verification document.
     *
     * FULL PERSISTENCE will be implemented when the DataChangeRequest entity
     * is built (Step 6).
     */
    @PostMapping("/change-requests")
    public ResponseEntity<?> submitChangeRequest(@RequestParam String institutionId,
                                                  @RequestBody Map<String, String> body) {
        try {
            String updateCategory = body.get("updateCategory");
            String proposedData = body.get("proposedData");
            String documentUrl = body.get("documentUrl");

            if (updateCategory == null || updateCategory.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "updateCategory is required."
                ));
            }
            if (proposedData == null || proposedData.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "proposedData (JSON payload) is required."
                ));
            }
            if (documentUrl == null || documentUrl.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "A new verification document URL is required for managed data changes."
                ));
            }

            DataChangeRequest request = changeRequestService.submitRequest(
                    institutionId,
                    updateCategory.trim(),
                    proposedData.trim(),
                    documentUrl.trim());

            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Change request submitted for Super Admin review.",
                "requestId", request.getRequestId(),
                "requestStatus", request.getRequestStatus()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Change request error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error processing change request."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  QUERY — Get Institution by ID (utility / testing)
    //  GET /api/v1/institutions/{institutionId}
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/{institutionId}")
    public ResponseEntity<?> getById(@PathVariable String institutionId) {
        try {
            Institution institution = institutionService.getById(institutionId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "institution", institution
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
