package com.feirs.backend.superadmin;

import com.feirs.backend.models.DataChangeRequest;
import com.feirs.backend.models.Institution;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Map;

/**
 * REST Controller for Super Admin operations.
 * Strictly isolated endpoints for global oversight, facility approvals,
 * and compliance verification.
 *
 * Per Rest APIs Plan.pdf Section 2 — Super Admin Operations:
 *   GET  /api/v1/super-admin/institutions/pending
 *   PUT  /api/v1/super-admin/institutions/{id}/review
 *   GET  /api/v1/super-admin/change-requests/pending
 *   PUT  /api/v1/super-admin/change-requests/{id}/resolve
 *   PUT  /api/v1/super-admin/institutions/{id}/status
 */
@RestController
@RequestMapping("/api/v1/super-admin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminController.class);

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  GET /api/v1/super-admin/institutions/pending
    //  Role: SUPER_ADMIN
    // ═══════════════════════════════════════════════════════════════

    /**
     * Returns all institutions awaiting manual verification.
     * The Super Admin reviews submitted documents and approves/rejects each.
     */
    @GetMapping("/institutions/pending")
    public ResponseEntity<?> getPendingInstitutions() {
        try {
            List<Institution> pending = superAdminService.getPendingInstitutions();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", pending.size(),
                "institutions", pending
            ));
        } catch (Exception e) {
            log.error("Error fetching pending institutions: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch pending institutions."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUT /api/v1/super-admin/institutions/{id}/review
    //  Role: SUPER_ADMIN
    // ═══════════════════════════════════════════════════════════════

    /**
     * Approves or rejects a pending institution registration.
     *
     * Request body:
     *   { "approved": true/false, "rejectionReason": "..." }
     *   rejectionReason is REQUIRED when approved = false
     */
    @PutMapping("/institutions/{id}/review")
    public ResponseEntity<?> reviewInstitution(@PathVariable String id,
                                                @RequestBody Map<String, Object> body) {
        try {
            boolean approved = (boolean) body.getOrDefault("approved", false);
            String rejectionReason = (String) body.getOrDefault("rejectionReason", null);

            if (!approved && (rejectionReason == null || rejectionReason.isBlank())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "rejectionReason is required when rejecting an institution."
                ));
            }

            Institution reviewed = superAdminService.reviewInstitution(
                    id, approved, rejectionReason);

            String message = approved
                ? "Institution approved. Activation email should be sent to: "
                    + reviewed.getOfficialEmail()
                : "Institution rejected. Reason: " + rejectionReason;

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", message,
                "institution", reviewed
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error reviewing institution {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to review institution."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  GET /api/v1/super-admin/change-requests/pending
    //  Role: SUPER_ADMIN
    // ═══════════════════════════════════════════════════════════════

    /**
     * Returns all pending data change requests from institutions.
     * BLOCKED on DataChangeRequest entity — currently returns empty list.
     */
    @GetMapping("/change-requests/pending")
    public ResponseEntity<?> getPendingChangeRequests() {
        try {
            List<DataChangeRequest> pending =
                    superAdminService.getPendingChangeRequests();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", pending.size(),
                "changeRequests", pending
            ));
        } catch (Exception e) {
            log.error("Error fetching change requests: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch change requests."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUT /api/v1/super-admin/change-requests/{id}/resolve
    //  Role: SUPER_ADMIN
    // ═══════════════════════════════════════════════════════════════

    /**
     * Approves or rejects a pending data change request.
     *
     * Request body:
     *   { "approved": true/false, "rejectionReason": "..." }
     *
     * BLOCKED on DataChangeRequest entity — currently logs the action only.
     */
    @PutMapping("/change-requests/{id}/resolve")
    public ResponseEntity<?> resolveChangeRequest(@PathVariable String id,
                                                   @RequestBody Map<String, Object> body) {
        try {
            boolean approved = (boolean) body.getOrDefault("approved", false);
            String superAdminId = (String) body.get("superAdminId");
            String rejectionReason = (String) body.getOrDefault("rejectionReason", null);

            if (superAdminId == null || superAdminId.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "superAdminId is required for non-repudiation audit trail."
                ));
            }
            if (!approved && (rejectionReason == null || rejectionReason.isBlank())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "rejectionReason is required when rejecting a change request."
                ));
            }

            DataChangeRequest resolved = superAdminService.resolveChangeRequest(
                    id, approved, superAdminId.trim(), rejectionReason);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", approved
                    ? "Change request APPROVED. Institution data updated."
                    : "Change request REJECTED. Reason: " + rejectionReason,
                "requestStatus", resolved.getRequestStatus(),
                "resolvedAt", resolved.getResolvedAt() != null
                    ? resolved.getResolvedAt().toString() : null
            ));
        } catch (Exception e) {
            log.error("Error resolving change request {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to resolve change request."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  PUT /api/v1/super-admin/institutions/{id}/status
    //  Role: SUPER_ADMIN
    // ═══════════════════════════════════════════════════════════════

    /**
     * Toggles an institution's account_status — the platform kill-switch.
     *
     * Request body:
     *   { "status": "ACTIVE" | "SUSPENDED" }
     *
     * Setting to SUSPENDED instantly locks out the Institution Admin AND
     * every Operator tied to that facility.
     */
    @PutMapping("/institutions/{id}/status")
    public ResponseEntity<?> setInstitutionStatus(@PathVariable String id,
                                                   @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "'status' field is required. Must be ACTIVE or SUSPENDED."
                ));
            }

            newStatus = newStatus.trim().toUpperCase();
            Institution updated = superAdminService.setInstitutionStatus(id, newStatus);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Institution " + id + " account status set to " + newStatus + ".",
                "institution", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error setting institution status {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to update institution status."
            ));
        }
    }
}
