package com.feirs.backend.institution;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.models.Institution;
import com.feirs.backend.models.PendingInstitutionRegistration;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.InstitutionRepository;
import com.feirs.backend.repositories.PendingInstitutionRegistrationRepository;
import com.feirs.backend.repositories.SuperAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class InstitutionService {

    private static final Logger log = LoggerFactory.getLogger(InstitutionService.class);
    private static final String ID_PREFIX = "FEIRS-INST";

    private final InstitutionRepository institutionRepository;
    private final PendingInstitutionRegistrationRepository pendingRepo;
    private final DataChangeRequestService changeRequestService;
    private final SuperAdminRepository superAdminRepository;

    public InstitutionService(InstitutionRepository institutionRepository,
                               PendingInstitutionRegistrationRepository pendingRepo,
                               DataChangeRequestService changeRequestService,
                               SuperAdminRepository superAdminRepository) {
        this.institutionRepository = institutionRepository;
        this.pendingRepo = pendingRepo;
        this.changeRequestService = changeRequestService;
        this.superAdminRepository = superAdminRepository;
    }

    public PendingInstitutionRegistration register(PendingInstitutionRegistration registration) {
        if (institutionRepository.existsByOfficialEmail(registration.getOfficialEmail()) ||
            pendingRepo.existsByOfficialEmailAndStatus(registration.getOfficialEmail(), "PENDING")) {
            throw new IllegalArgumentException(
                "An institution with this official email is already registered or pending.");
        }

        registration.setStatus("PENDING");
        PendingInstitutionRegistration saved = pendingRepo.save(registration);
        log.info("✅ Institution registered (PENDING): {}", saved.getInstitutionName());
        return saved;
    }

    @Transactional(readOnly = true)
    public Institution getById(String institutionId) {
        return institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Institution not found: " + institutionId));
    }

    public Institution updateSelfService(String institutionId, Institution updates) {
        Institution existing = getById(institutionId);

        if (updates.getPhoneCountryCode() != null) {
            existing.setPhoneCountryCode(updates.getPhoneCountryCode());
        }
        if (updates.getPhoneNumber() != null) {
            existing.setPhoneNumber(updates.getPhoneNumber());
        }
        if (updates.getPrimaryOfficerName() != null) {
            existing.setPrimaryOfficerName(updates.getPrimaryOfficerName());
        }
        if (updates.getOfficerDesignation() != null) {
            existing.setOfficerDesignation(updates.getOfficerDesignation());
        }
        if (updates.getInstitutionLogoUrl() != null) {
            existing.setInstitutionLogoUrl(updates.getInstitutionLogoUrl());
        }

        Institution saved = institutionRepository.save(existing);
        log.info("✅ Institution self-service updated: {}", institutionId);
        return saved;
    }

    public void submitChangeRequest(String institutionId,
                                     String fieldName,
                                     String proposedValue,
                                     String documentUrl) {
        String proposedDataJson = "{\"" + fieldName + "\": \"" + proposedValue + "\"}";
        changeRequestService.submitRequest(
                institutionId, fieldName.toUpperCase(), proposedDataJson, documentUrl);
        log.info("📋 Change request submitted by {} for field: {}", institutionId, fieldName);
    }

    @Transactional(readOnly = true)
    public List<PendingInstitutionRegistration> getPendingRegistrations() {
        return pendingRepo.findByStatus("PENDING");
    }

    public Institution reviewRegistration(Long registrationId,
                                           boolean approved,
                                           String rejectionReason,
                                           String superAdminId) {
        PendingInstitutionRegistration pending = pendingRepo.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

        if (!"PENDING".equals(pending.getStatus())) {
            throw new IllegalStateException("Registration is not in PENDING state.");
        }

        if (approved) {
            pending.setStatus("APPROVED");
            pendingRepo.save(pending);

            Institution institution = new Institution();
            institution.setInstitutionId(generateInstitutionId());
            institution.setInstitutionName(pending.getInstitutionName());
            institution.setOfficialEmail(pending.getOfficialEmail());
            institution.setInstitutionType(pending.getInstitutionType());
            institution.setSectorType(pending.getSectorType());
            institution.setPrimaryOfficerName(pending.getPrimaryOfficerName());
            institution.setOfficerDesignation(pending.getOfficerDesignation());
            institution.setPhoneCountryCode(pending.getPhoneCountryCode());
            institution.setPhoneNumber(pending.getPhoneNumber());
            institution.setAddressLine1(pending.getAddressLine1());
            institution.setAddressLine2(pending.getAddressLine2());
            institution.setCity(pending.getCity());
            institution.setState(pending.getState());
            institution.setCountry(pending.getCountry());
            institution.setPinCode(pending.getPinCode());
            institution.setInstitutionLogoUrl(pending.getInstitutionLogoUrl());
            institution.setVerificationDocumentUrl(pending.getVerificationDocumentUrl());
            institution.setAccountStatus("ACTIVE");

            if (superAdminId != null) {
                SuperAdmin admin = superAdminRepository.findById(superAdminId).orElse(null);
                institution.setLinkedSuperAdmin(admin);
            }

            Institution saved = institutionRepository.save(institution);
            log.info("✅ Institution APPROVED: {} — {}", saved.getInstitutionId(), saved.getInstitutionName());
            return saved;
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required.");
            }
            pending.setStatus("REJECTED");
            pending.setRejectionReason(rejectionReason);
            pendingRepo.save(pending);
            log.info("❌ Registration REJECTED: {} — Reason: {}", pending.getInstitutionName(), rejectionReason);
            return null;
        }
    }

    public Institution setAccountStatus(String institutionId, String newStatus) {
        if (!List.of("ACTIVE", "SUSPENDED").contains(newStatus)) {
            throw new IllegalArgumentException("Invalid account status: " + newStatus);
        }
        Institution institution = getById(institutionId);
        institution.setAccountStatus(newStatus);
        Institution saved = institutionRepository.save(institution);
        log.info("🔒 Institution {} account status set to: {}", institutionId, newStatus);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Institution> getApprovedInstitutions() {
        return institutionRepository.findAll();
    }

    private String generateInstitutionId() {
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return ID_PREFIX + "-" + suffix;
    }
}
