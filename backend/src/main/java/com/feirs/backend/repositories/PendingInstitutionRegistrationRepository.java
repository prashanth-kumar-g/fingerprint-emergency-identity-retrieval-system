package com.feirs.backend.repositories;

import com.feirs.backend.models.PendingInstitutionRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingInstitutionRegistrationRepository extends JpaRepository<PendingInstitutionRegistration, Long> {
    boolean existsByOfficialEmail(String officialEmail);
    boolean existsByOfficialEmailAndStatus(String officialEmail, String status);
    List<PendingInstitutionRegistration> findByStatus(String status);
}
