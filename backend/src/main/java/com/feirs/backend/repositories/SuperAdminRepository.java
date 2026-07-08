package com.feirs.backend.repositories;

import com.feirs.backend.models.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for the super_admins table.
 * PK type is String (manually assigned IDs like FEIRS-SA-ROOT).
 */
@Repository
public interface SuperAdminRepository extends JpaRepository<SuperAdmin, String> {

    /**
     * Lookup by master email — used during Dual Login authentication
     * and for email uniqueness validation.
     */
    Optional<SuperAdmin> findByMasterEmail(String masterEmail);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM SuperAdmin s WHERE LOWER(s.superAdminId) = LOWER(:identifier) OR LOWER(s.masterEmail) = LOWER(:identifier)")
    Optional<SuperAdmin> findByIdentifierIgnoreCase(@org.springframework.data.repository.query.Param("identifier") String identifier);

    /**
     * Efficient existence check to prevent duplicate root accounts during seeding.
     */
    boolean existsByMasterEmail(String masterEmail);

    /**
     * Finds a regional Super Admin based on exact location match.
     */
    Optional<SuperAdmin> findFirstByCityIgnoreCaseAndStateIgnoreCaseAndCountryIgnoreCase(String city, String state, String country);
}
