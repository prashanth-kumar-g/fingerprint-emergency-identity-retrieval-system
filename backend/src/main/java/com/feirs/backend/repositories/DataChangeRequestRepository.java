package com.feirs.backend.repositories;

import com.feirs.backend.models.DataChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the data_change_requests table.
 * PK type is String (manually assigned IDs like FEIRS-REQ-7742).
 *
 * Powers the Super Admin's compliance review dashboard and the
 * Institution Admin's request history.
 */
@Repository
public interface DataChangeRequestRepository
        extends JpaRepository<DataChangeRequest, String> {

    /**
     * Super Admin dashboard: all PENDING requests awaiting review.
     */
    List<DataChangeRequest> findByRequestStatusOrderByCreatedAtDesc(String requestStatus);

    /**
     * Institution Admin: view all change requests submitted by their facility.
     */
    List<DataChangeRequest> findByInstitution_InstitutionIdOrderByCreatedAtDesc(
            String institutionId);

    /**
     * Institution Admin: filter their requests by status (e.g., all APPROVED requests).
     */
    List<DataChangeRequest> findByInstitution_InstitutionIdAndRequestStatusOrderByCreatedAtDesc(
            String institutionId, String requestStatus);

    /**
     * Count pending requests (for Super Admin dashboard metric card).
     */
    long countByRequestStatus(String requestStatus);
}
