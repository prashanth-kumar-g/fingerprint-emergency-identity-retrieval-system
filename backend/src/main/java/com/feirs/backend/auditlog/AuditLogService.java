package com.feirs.backend.auditlog;

import com.feirs.backend.models.AuditLog;
import com.feirs.backend.repositories.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-only reporting service for the centralized audit ledger.
 * Powers all three role-based dashboards via filtered queries.
 *
 * Per Audit Logs Table Plan.pdf + Rest APIs Plan.pdf Section 6.
 */
@Service
@Transactional(readOnly = true)
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private static final int DEFAULT_PAGE_SIZE = 50;

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // ═════════════════════════════════════════════════════════
    //  SUPER ADMIN — Global Platform Oversight
    //  GET /api/v1/audit-logs/global
    // ═════════════════════════════════════════════════════════

    /**
     * Returns all platform events across every institution, newest first.
     * Paginated for performance — audit_logs can grow into millions of rows.
     */
    public Page<AuditLog> getGlobalLogs(int page, int size) {
        Page<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc(
                PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE));
        log.info("📋 Global audit logs — page {} of {}", page, logs.getTotalPages());
        return logs;
    }

    /**
     * Returns events filtered by action type across the entire platform.
     */
    public Page<AuditLog> getGlobalLogsByType(String actionType, int page, int size) {
        return auditLogRepository.findByActionTypeOrderByTimestampDesc(
                actionType, PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE));
    }

    // ═════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Facility-Scoped Audit
    //  GET /api/v1/audit-logs/facility
    // ═════════════════════════════════════════════════════════

    /**
     * Multi-tenant filtered: only events belonging to a specific institution.
     * Institution Admins can NEVER see another hospital's logs.
     */
    public Page<AuditLog> getFacilityLogs(String institutionId, int page, int size) {
        Page<AuditLog> logs = auditLogRepository.findByInstitutionIdOrderByTimestampDesc(
                institutionId, PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE));
        log.info("📋 Facility audit logs for {} — {} records", institutionId,
                logs.getTotalElements());
        return logs;
    }

    /**
     * Multi-tenant + type filtered: e.g., all EMERGENCY_SCAN events at this facility.
     */
    public Page<AuditLog> getFacilityLogsByType(String institutionId,
                                                  String actionType,
                                                  int page, int size) {
        return auditLogRepository.findByInstitutionIdAndActionTypeOrderByTimestampDesc(
                institutionId, actionType,
                PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE));
    }

    // ═════════════════════════════════════════════════════════
    //  OPERATOR — Personal Scan History
    //  GET /api/v1/audit-logs/personal
    // ═════════════════════════════════════════════════════════

    /**
     * Returns an Operator's own action history — their scans, enrollments, etc.
     * Operators can only see their own logs.
     */
    public Page<AuditLog> getPersonalLogs(String actorId, int page, int size) {
        Page<AuditLog> logs = auditLogRepository.findByActorIdOrderByTimestampDesc(
                actorId, PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE));
        log.info("📋 Personal audit logs for {} — {} records", actorId,
                logs.getTotalElements());
        return logs;
    }

    /**
     * Personal + type filtered: e.g., "My emergency scans this week."
     */
    public Page<AuditLog> getPersonalLogsByType(String actorId,
                                                  String actionType,
                                                  int page, int size) {
        return auditLogRepository.findByActorIdAndActionTypeOrderByTimestampDesc(
                actorId, actionType,
                PageRequest.of(page, size > 0 ? size : DEFAULT_PAGE_SIZE));
    }
}
