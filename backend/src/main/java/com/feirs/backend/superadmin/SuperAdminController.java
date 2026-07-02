package com.feirs.backend.superadmin;

import com.feirs.backend.models.DataChangeRequest;
import com.feirs.backend.models.Institution;
import com.feirs.backend.models.PendingInstitutionRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/super-admin")
@CrossOrigin(origins = "*")
public class SuperAdminController {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminController.class);

    private final SuperAdminService superAdminService;

    public SuperAdminController(SuperAdminService superAdminService) {
        this.superAdminService = superAdminService;
    }

    @GetMapping("/institutions/pending")
    public ResponseEntity<?> getPendingInstitutions() {
        try {
            List<PendingInstitutionRegistration> pending = superAdminService.getPendingInstitutions();
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

    @PutMapping("/institutions/{id}/review")
    public ResponseEntity<?> reviewInstitution(@PathVariable Long id,
                                                @RequestBody Map<String, Object> body,
                                                @RequestParam(required = false) String superAdminId) {
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
                    id, approved, rejectionReason, superAdminId);

            String message = approved
                ? "Institution approved. Activation email should be sent to: "
                    + reviewed.getOfficialEmail()
                : "Institution rejected. Reason: " + rejectionReason;

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", message,
                "institution", reviewed == null ? "REJECTED" : reviewed
            ));

        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/change-requests/pending")
    public ResponseEntity<?> getPendingChangeRequests() {
        try {
            List<DataChangeRequest> pending = superAdminService.getPendingChangeRequests();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", pending.size(),
                "requests", pending
            ));
        } catch (Exception e) {
            log.error("Error fetching pending change requests: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch pending change requests."
            ));
        }
    }

    @PutMapping("/change-requests/{id}/resolve")
    public ResponseEntity<?> resolveChangeRequest(@PathVariable String id,
                                                   @RequestBody Map<String, Object> body,
                                                   @RequestParam String superAdminId) {
        try {
            boolean approved = (boolean) body.getOrDefault("approved", false);
            String rejectionReason = (String) body.getOrDefault("rejectionReason", null);

            DataChangeRequest resolved = superAdminService.resolveChangeRequest(
                    id, approved, rejectionReason, superAdminId);

            String message = approved
                ? "Change request approved and institution profile updated."
                : "Change request rejected.";

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", message,
                "request", resolved
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @PutMapping("/institutions/{id}/status")
    public ResponseEntity<?> setInstitutionStatus(@PathVariable String id,
                                                   @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "status field is required in request body."
                ));
            }

            Institution updated = superAdminService.setInstitutionAccountStatus(id, newStatus);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Institution account status successfully updated to " + newStatus,
                "institutionId", updated.getInstitutionId(),
                "accountStatus", updated.getAccountStatus()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
