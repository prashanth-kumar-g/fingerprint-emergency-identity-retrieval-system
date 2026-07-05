package com.feirs.backend.repositories;

import com.feirs.backend.models.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA repository for the audit_logs table.
 * PK type is Long (BIGINT auto-increment — for high-volume log tables).
 *
 * Powers all three role-based dashboards via filtered SQL WHERE queries.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // ═══════════════════════════════════════════════════════════
    //  SUPER ADMIN — Global Oversight
    //  GET /api/v1/audit-logs/global
    // ═══════════════════════════════════════════════════════════

    /**
     * All logs across the entire platform, newest first (paginated).
     */
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);

    /**
     * Global security alerts: all failed login attempts anywhere on the platform.
     */
    List<AuditLog> findByActionTypeAndActionStatusOrderByTimestampDesc(
            String actionType, String actionStatus);

    /**
     * Global filter by action type (e.g., all EMERGENCY_SCAN events across all institutions).
     */
    Page<AuditLog> findByActionTypeOrderByTimestampDesc(String actionType, Pageable pageable);

    // ═══════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Facility-Scoped
    //  GET /api/v1/audit-logs/facility
    // ═══════════════════════════════════════════════════════════

    /**
     * Multi-tenant: all events tagged to a specific target.
     */
    Page<AuditLog> findByTargetIdAndTargetRoleOrderByTimestampDesc(
            String targetId, String targetRole, Pageable pageable);

    /**
     * Multi-tenant + type filter: e.g., all CITIZEN_ENROLL events at this target.
     */
    Page<AuditLog> findByTargetIdAndTargetRoleAndActionTypeOrderByTimestampDesc(
            String targetId, String targetRole, String actionType, Pageable pageable);

    /**
     * Multi-tenant security: failed logins at a specific target.
     */
    List<AuditLog> findByTargetIdAndTargetRoleAndActionTypeAndActionStatusOrderByTimestampDesc(
            String targetId, String targetRole, String actionType, String actionStatus);

    // ═══════════════════════════════════════════════════════════
    //  OPERATOR — Personal Scan History
    //  GET /api/v1/audit-logs/personal
    // ═══════════════════════════════════════════════════════════

    /**
     * Personal history: all actions performed by a specific actor.
     */
    Page<AuditLog> findByActorIdOrderByTimestampDesc(String actorId, Pageable pageable);

    /**
     * Personal + type filter: e.g., "My emergency scans today."
     */
    Page<AuditLog> findByActorIdAndActionTypeOrderByTimestampDesc(
            String actorId, String actionType, Pageable pageable);

    // ═══════════════════════════════════════════════════════════
    //  TIME-RANGE QUERIES (for dashboard metrics)
    // ═══════════════════════════════════════════════════════════

    /**
     * Count events of a given type within a time range (for metric cards).
     */
    long countByActionTypeAndTimestampBetween(
            String actionType, LocalDateTime start, LocalDateTime end);

    /**
     * Count events at a target within a time range.
     */
    long countByTargetIdAndTargetRoleAndActionTypeAndTimestampBetween(
            String targetId, String targetRole, String actionType, LocalDateTime start, LocalDateTime end);

    /**
     * Count events by an actor within a time range.
     */
    long countByActorIdAndActionTypeAndTimestampBetween(
            String actorId, String actionType, LocalDateTime start, LocalDateTime end);
}
