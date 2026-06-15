package com.feirs.backend.repositories;

import com.feirs.backend.models.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the operators table.
 * PK type is String (manually assigned IDs like FEIRS-OP-90812).
 *
 * Multi-Tenant: All queries scoped by institution_id for Institution Admin dashboards.
 */
@Repository
public interface OperatorRepository extends JpaRepository<Operator, String> {

    /**
     * Dual Login lookup by official email.
     */
    Optional<Operator> findByOfficialEmail(String officialEmail);

    /**
     * Prevents duplicate operator registrations within the platform.
     */
    boolean existsByOfficialEmail(String officialEmail);

    /**
     * Multi-tenant: returns all operators bound to a specific institution.
     */
    List<Operator> findByInstitution_InstitutionId(String institutionId);

    /**
     * Multi-tenant + status filter: returns operators of a given status
     * within a specific institution (e.g., all SUSPENDED operators at MSRIT).
     */
    List<Operator> findByInstitution_InstitutionIdAndAccountStatus(
            String institutionId, String accountStatus);

    /**
     * Filter by department within an institution (e.g., "Emergency Room").
     */
    List<Operator> findByInstitution_InstitutionIdAndDepartment(
            String institutionId, String department);

    /**
     * Global filter by account status — for Super Admin oversight.
     */
    List<Operator> findByAccountStatus(String accountStatus);
}
