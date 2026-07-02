package com.feirs.backend.superadmin;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.institution.InstitutionService;
import com.feirs.backend.models.DataChangeRequest;
import com.feirs.backend.models.Institution;
import com.feirs.backend.models.PendingInstitutionRegistration;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.SuperAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SuperAdminService {

    private static final Logger log = LoggerFactory.getLogger(SuperAdminService.class);

    private final SuperAdminRepository superAdminRepository;
    private final InstitutionService institutionService;
    private final DataChangeRequestService changeRequestService;

    public SuperAdminService(SuperAdminRepository superAdminRepository,
                              InstitutionService institutionService,
                              DataChangeRequestService changeRequestService) {
        this.superAdminRepository = superAdminRepository;
        this.institutionService = institutionService;
        this.changeRequestService = changeRequestService;
    }

    @Transactional(readOnly = true)
    public SuperAdmin getById(String superAdminId) {
        return superAdminRepository.findById(superAdminId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Super Admin not found: " + superAdminId));
    }

    @Transactional(readOnly = true)
    public List<PendingInstitutionRegistration> getPendingInstitutions() {
        return institutionService.getPendingRegistrations();
    }

    public Institution reviewInstitution(Long registrationId, boolean approved, String rejectionReason, String superAdminId) {
        log.info("Super Admin {} reviewing registration {} - Approved: {}", 
                 superAdminId, registrationId, approved);
        return institutionService.reviewRegistration(registrationId, approved, rejectionReason, superAdminId);
    }

    @Transactional(readOnly = true)
    public List<DataChangeRequest> getPendingChangeRequests() {
        return changeRequestService.getPendingRequests();
    }

    public DataChangeRequest resolveChangeRequest(String requestId,
                                                   boolean approved,
                                                   String rejectionReason,
                                                   String superAdminId) {
        SuperAdmin admin = getById(superAdminId);
        log.info("Super Admin {} resolving change request {} - Approved: {}",
                 admin.getSuperAdminId(), requestId, approved);
        
        return changeRequestService.resolveRequest(requestId, approved, rejectionReason, superAdminId);
    }

    public Institution setInstitutionAccountStatus(String institutionId, String newStatus) {
        log.info("Super Admin changing account status for {} to {}", institutionId, newStatus);
        return institutionService.setAccountStatus(institutionId, newStatus);
    }
}
