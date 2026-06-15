package com.feirs.backend.operator;

import com.feirs.backend.models.Operator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Operator HR management and self-service.
 *
 * Per Rest APIs Plan.pdf Section 4:
 *   POST   /api/v1/operators           — INST_ADMIN (add operator)
 *   GET    /api/v1/operators           — INST_ADMIN (list operators)
 *   PUT    /api/v1/operators/{id}/status — INST_ADMIN (suspend/enable)
 *   GET    /api/v1/operators/profile   — OPERATOR (view own profile)
 *   PUT    /api/v1/operators/profile   — OPERATOR (update contact info)
 */
@RestController
@RequestMapping("/api/v1/operators")
@CrossOrigin(origins = "*")
public class OperatorController {

    private static final Logger log = LoggerFactory.getLogger(OperatorController.class);

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Add Operator
    //  POST /api/v1/operators?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    @PostMapping
    public ResponseEntity<?> createOperator(@RequestParam String institutionId,
                                             @RequestBody Operator operator) {
        try {
            Operator saved = operatorService.createOperator(institutionId, operator);
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Operator created. Activation email should be sent to: "
                    + saved.getOfficialEmail(),
                "operatorId", saved.getOperatorId(),
                "operator", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error creating operator: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error creating operator."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — List Operators by Institution
    //  GET /api/v1/operators?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    @GetMapping
    public ResponseEntity<?> listOperators(@RequestParam String institutionId) {
        try {
            List<Operator> operators = operatorService.getOperatorsByInstitution(institutionId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", operators.size(),
                "operators", operators
            ));
        } catch (Exception e) {
            log.error("Error listing operators: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to list operators."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Toggle Operator Status
    //  PUT /api/v1/operators/{id}/status
    // ═══════════════════════════════════════════════════════════════

    @PutMapping("/{id}/status")
    public ResponseEntity<?> setOperatorStatus(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (newStatus == null || newStatus.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "'status' field is required. Must be ACTIVE or SUSPENDED."
                ));
            }
            Operator updated = operatorService.setOperatorStatus(
                    id, newStatus.trim().toUpperCase());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Operator " + id + " status set to " + updated.getAccountStatus(),
                "operator", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error setting operator status: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to update operator status."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — View Own Profile
    //  GET /api/v1/operators/profile?operatorId=FEIRS-OP-XXXX
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String operatorId) {
        try {
            Operator operator = operatorService.getProfile(operatorId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "operator", operator
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Update Own Contact Info
    //  PUT /api/v1/operators/profile?operatorId=FEIRS-OP-XXXX
    // ═══════════════════════════════════════════════════════════════

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestParam String operatorId,
                                            @RequestBody Operator updates) {
        try {
            Operator updated = operatorService.updateProfile(operatorId, updates);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile updated successfully.",
                "operator", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating operator profile: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error updating profile."
            ));
        }
    }
}
