package com.feirs.backend.repositories;

import com.feirs.backend.models.Institution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for the institutions table.
 * PK type is String (manually assigned IDs like FEIRS-INST-MSRIT).
 */
@Repository
public interface InstitutionRepository extends JpaRepository<Institution, String> {

    /**
     * Lookup by official email — used during Dual Login authentication
     * and for email uniqueness validation during registration.
     */
    Optional<Institution> findByOfficialEmail(String officialEmail);

    /**
     * Efficient existence check to prevent duplicate registrations.
     */
    boolean existsByOfficialEmail(String officialEmail);

    /**
     * Filter by approval status — used by Super Admin's verification dashboard
     * to list PENDING registrations awaiting review.
     */
    List<Institution> findByApprovalStatus(String approvalStatus);

    /**
     * Filter by account status — used to query active, suspended, or deactivated institutions.
     */
    List<Institution> findByAccountStatus(String accountStatus);

    /**
     * Combined filter — find all institutions of a given type with a specific approval status.
     * e.g., "HOSPITAL" + "APPROVED" for operator selection dropdowns.
     */
    List<Institution> findByInstitutionTypeAndApprovalStatus(String institutionType, String approvalStatus);
}
