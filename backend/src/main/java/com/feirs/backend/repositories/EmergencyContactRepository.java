package com.feirs.backend.repositories;

import com.feirs.backend.models.EmergencyContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the emergency_contacts table.
 * PK type is String (manually assigned IDs like FEIRS-EC-1092).
 *
 * One citizen can have 1–10 emergency contacts. During an emergency scan,
 * all contacts are instantly pulled and alerts are triggered.
 */
@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, String> {

    /**
     * Lifesaving query — during an emergency scan, pulls ALL emergency
     * contacts linked to the matched citizen for instant alerting.
     *
     * SELECT * FROM emergency_contacts WHERE citizen_id = ?
     */
    List<EmergencyContact> findByCitizen_CitizenId(String citizenId);

    /**
     * Count contacts for a specific citizen (max 10 per enrollment form).
     */
    long countByCitizen_CitizenId(String citizenId);

    /**
     * Delete all contacts for a citizen when the citizen is tombstoned.
     */
    void deleteByCitizen_CitizenId(String citizenId);
}
