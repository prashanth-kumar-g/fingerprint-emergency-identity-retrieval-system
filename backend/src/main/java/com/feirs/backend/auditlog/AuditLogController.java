package com.feirs.backend.auditlog;

import com.feirs.backend.models.AuditLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Read-only REST Controller for the centralized audit ledger.
 * Powers all three role-based dashboards with paginated, filtered log views.
 *
 * Per Rest APIs Plan.pdf Section 6 — Centralized Ledger:
 *   GET  /api/v1/audit-logs/global    — SUPER_ADMIN (all events, all institutions)
 *   GET  /api/v1/audit-logs/facility   — INST_ADMIN (multi-tenant scoped)
 *   GET  /api/v1/audit-logs/personal   — OPERATOR (actor's own history)
 */
@RestController
@RequestMapping("/api/v1/audit-logs")
@CrossOrigin(origins = "*")
public class AuditLogController {

    private static final Logger log = LoggerFactory.getLogger(AuditLogController.class);

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    // ═════════════════════════════════════════════════════════
    //  SUPER ADMIN — Global Platform Oversight
    //  GET /api/v1/audit-logs/global
    // ═════════════════════════════════════════════════════════

    /**
     * Returns all platform events across every institution.
     * Optional query param: ?actionType=EMERGENCY_SCAN to filter by type.
     * Paginated with ?page=0&size=50 (default 50 per page).
     *
     * Role: SUPER_ADMIN
     */
    @GetMapping("/global")
    public ResponseEntity<?> getGlobalLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String actionType) {
        try {
            Page<AuditLog> logs;
            if (actionType != null && !actionType.isBlank()) {
                logs = auditLogService.getGlobalLogsByType(
                        actionType.trim().toUpperCase(), page, size);
            } else {
                logs = auditLogService.getGlobalLogs(page, size);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "page", logs.getNumber(),
                "totalPages", logs.getTotalPages(),
                "totalElements", logs.getTotalElements(),
                "size", logs.getSize(),
                "logs", logs.getContent()
            ));
        } catch (Exception e) {
            log.error("Error fetching global audit logs: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch global audit logs."
            ));
        }
    }

    // ═════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Facility-Scoped Audit
    //  GET /api/v1/audit-logs/facility?institutionId=FEIRS-INST-XXXX
    // ═════════════════════════════════════════════════════════

    /**
     * Returns events scoped to a single institution.
     * Multi-tenant isolation: the Institution Admin can NEVER see
     * another hospital's logs.
     *
     * Optional query param: ?actionType=CITIZEN_ENROLL
     *
     * Role: INSTITUTION_ADMIN
     */
    @GetMapping("/facility")
    public ResponseEntity<?> getFacilityLogs(
            @RequestParam String institutionId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String actionType) {
        try {
            Page<AuditLog> logs;
            if (actionType != null && !actionType.isBlank()) {
                logs = auditLogService.getFacilityLogsByType(
                        institutionId, actionType.trim().toUpperCase(), page, size);
            } else {
                logs = auditLogService.getFacilityLogs(institutionId, page, size);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "institutionId", institutionId,
                "page", logs.getNumber(),
                "totalPages", logs.getTotalPages(),
                "totalElements", logs.getTotalElements(),
                "size", logs.getSize(),
                "logs", logs.getContent()
            ));
        } catch (Exception e) {
            log.error("Error fetching facility audit logs: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch facility audit logs."
            ));
        }
    }

    // ═════════════════════════════════════════════════════════
    //  OPERATOR — Personal Scan History
    //  GET /api/v1/audit-logs/personal?actorId=FEIRS-OP-XXXX
    // ═════════════════════════════════════════════════════════

    /**
     * Returns an Operator's own action history — their scans, enrollments,
     * and profile modifications. Operator can only see their own logs.
     *
     * Optional query param: ?actionType=EMERGENCY_SCAN
     *
     * Role: OPERATOR
     */
    @GetMapping("/personal")
    public ResponseEntity<?> getPersonalLogs(
            @RequestParam String actorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String actionType) {
        try {
            Page<AuditLog> logs;
            if (actionType != null && !actionType.isBlank()) {
                logs = auditLogService.getPersonalLogsByType(
                        actorId, actionType.trim().toUpperCase(), page, size);
            } else {
                logs = auditLogService.getPersonalLogs(actorId, page, size);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "actorId", actorId,
                "page", logs.getNumber(),
                "totalPages", logs.getTotalPages(),
                "totalElements", logs.getTotalElements(),
                "size", logs.getSize(),
                "logs", logs.getContent()
            ));
        } catch (Exception e) {
            log.error("Error fetching personal audit logs: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Failed to fetch personal audit logs."
            ));
        }
    }
}
