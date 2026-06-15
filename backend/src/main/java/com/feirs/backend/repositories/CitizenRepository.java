package com.feirs.backend.repositories;

import com.feirs.backend.models.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the citizens table.
 * PK type is String (manually assigned IDs like FEIRS-CIT-40921).
 *
 * The global biometric master record — queried during emergency scans
 * across all institutions for 1:N fingerprint matching.
 */
@Repository
public interface CitizenRepository extends JpaRepository<Citizen, String> {

    /**
     * Returns all ACTIVE citizens for 1:N biometric matching during emergency scan.
     * Only ACTIVE records are scanned — DELETED (tombstoned) records are excluded.
     */
    List<Citizen> findByAccountStatus(String accountStatus);

    /**
     * Multi-tenant: returns all citizens enrolled by a specific institution.
     */
    List<Citizen> findByEnrollingInstitution_InstitutionId(String institutionId);

    /**
     * Tenant + status filter: e.g., all DELETED citizens at a specific hospital.
     */
    List<Citizen> findByEnrollingInstitution_InstitutionIdAndAccountStatus(
            String institutionId, String accountStatus);

    /**
     * Find by blood group — emergency filtering (e.g., find all "O-" donors in the system).
     */
    List<Citizen> findByBloodGroupAndAccountStatus(String bloodGroup, String accountStatus);

    /**
     * Count citizens enrolled by a specific institution (for analytics dashboards).
     */
    long countByEnrollingInstitution_InstitutionId(String institutionId);

    /**
     * Count active citizens in the system.
     */
    long countByAccountStatus(String accountStatus);
}
