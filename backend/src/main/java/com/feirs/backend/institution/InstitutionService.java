package com.feirs.backend.institution;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.models.Institution;
import com.feirs.backend.models.PendingInstitutionRegistration;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.InstitutionRepository;
import com.feirs.backend.repositories.PendingInstitutionRegistrationRepository;
import com.feirs.backend.repositories.SuperAdminRepository;
import com.feirs.backend.security.services.EmailService;
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
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final com.feirs.backend.config.SupabaseStorageService storageService;
    private final EmailService emailService;
    private final com.feirs.backend.security.jwt.JwtUtils jwtUtils;

    public InstitutionService(InstitutionRepository institutionRepository,
                               PendingInstitutionRegistrationRepository pendingRepo,
                               DataChangeRequestService changeRequestService,
                               SuperAdminRepository superAdminRepository,
                               org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
                               com.feirs.backend.config.SupabaseStorageService storageService,
                               EmailService emailService,
                               com.feirs.backend.security.jwt.JwtUtils jwtUtils) {
        this.institutionRepository = institutionRepository;
        this.pendingRepo = pendingRepo;
        this.changeRequestService = changeRequestService;
        this.superAdminRepository = superAdminRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
        this.emailService = emailService;
        this.jwtUtils = jwtUtils;
    }

    public PendingInstitutionRegistration register(PendingInstitutionRegistration registration,
                                                   org.springframework.web.multipart.MultipartFile logoFile,
                                                   org.springframework.web.multipart.MultipartFile licenseFile) throws Exception {
        if (institutionRepository.existsByOfficialEmail(registration.getOfficialEmail()) ||
            pendingRepo.existsByOfficialEmailAndStatus(registration.getOfficialEmail(), "PENDING")) {
            throw new IllegalArgumentException(
                "An institution with this official email is already registered or pending.");
        }

        // Routing Logic
        SuperAdmin routedAdmin = superAdminRepository
                .findFirstByCityIgnoreCaseAndStateIgnoreCaseAndCountryIgnoreCase(
                        registration.getCity(), registration.getState(), registration.getCountry()
                )
                .orElseGet(() -> superAdminRepository.findById("FEIRS-SA-GLOBAL").orElse(null));
        registration.setRoutedSuperAdmin(routedAdmin);

        registration.setStatus("PENDING");
        registration.setRegistrationId(generateRegistrationId());

        if (logoFile != null && !logoFile.isEmpty()) {
            String logoUrl = storageService.uploadFile(logoFile, "FEIRS-Bucket", "institution-logos/" + registration.getRegistrationId());
            registration.setInstitutionLogoUrl(logoUrl);
        }

        if (licenseFile != null && !licenseFile.isEmpty()) {
            String licenseUrl = storageService.uploadFile(licenseFile, "FEIRS-Bucket", "verification-documents/" + registration.getRegistrationId());
            registration.setVerificationDocumentUrl(licenseUrl);
        } else {
            throw new IllegalArgumentException("Verification document is required.");
        }

        PendingInstitutionRegistration saved = pendingRepo.save(registration);
        log.info("✅ Institution registered (PENDING): {} routed to {}", saved.getInstitutionName(), routedAdmin != null ? routedAdmin.getSuperAdminId() : "NONE");
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

    public Institution updateEmail(String institutionId, String newEmail, String currentPassword) {
        Institution existing = getById(institutionId);
        if (!passwordEncoder.matches(currentPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect password.");
        }
        if (institutionRepository.existsByOfficialEmail(newEmail)) {
            throw new IllegalArgumentException("Email is already in use.");
        }
        existing.setOfficialEmail(newEmail);
        Institution saved = institutionRepository.save(existing);
        log.info("✅ Institution email updated: {}", institutionId);
        return saved;
    }

    public void updatePassword(String institutionId, String oldPassword, String newPassword) {
        Institution existing = getById(institutionId);
        if (!passwordEncoder.matches(oldPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect old password.");
        }
        if (passwordEncoder.matches(newPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Old and new password cannot be the same.");
        }
        existing.setPasswordHash(passwordEncoder.encode(newPassword));
        institutionRepository.save(existing);
        log.info("✅ Institution password updated: {}", institutionId);
    }

    public String uploadLogo(String institutionId, org.springframework.web.multipart.MultipartFile file) throws Exception {
        Institution existing = getById(institutionId);
        
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Only JPG/PNG files are allowed.");
        }

        if (existing.getInstitutionLogoUrl() != null) {
            storageService.deleteFileByUrl(existing.getInstitutionLogoUrl(), "FEIRS-Bucket");
        }

        String publicUrl = storageService.uploadFile(file, "FEIRS-Bucket", "institution-logos/" + institutionId);
        existing.setInstitutionLogoUrl(publicUrl);
        institutionRepository.save(existing);
        
        log.info("✅ Institution logo updated: {}", institutionId);
        return publicUrl;
    }

    @Transactional(readOnly = true)
    public List<PendingInstitutionRegistration> getPendingRegistrations() {
        return pendingRepo.findByStatus("PENDING");
    }

    @Transactional(readOnly = true)
    public List<Institution> getAllInstitutions() {
        return institutionRepository.findAll();
    }

    public Institution reviewRegistration(String registrationId,
                                           boolean approved,
                                           String rejectionReason,
                                           String superAdminId) {
        PendingInstitutionRegistration pending = pendingRepo.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Registration not found"));

        if (!"PENDING".equals(pending.getStatus())) {
            throw new IllegalStateException("Registration is not in PENDING state.");
        }

        if (approved) {
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
            try {
                String newLogoUrl = storageService.moveFileByUrl(pending.getInstitutionLogoUrl(), "FEIRS-Bucket", "institution-logos/" + institution.getInstitutionId());
                institution.setInstitutionLogoUrl(newLogoUrl);
            } catch (Exception e) {
                log.error("Failed to move logo for {}", institution.getInstitutionId(), e);
                institution.setInstitutionLogoUrl(pending.getInstitutionLogoUrl());
            }

            try {
                String newLicenseUrl = storageService.moveFileByUrl(pending.getVerificationDocumentUrl(), "FEIRS-Bucket", "verification-documents/" + institution.getInstitutionId());
                institution.setVerificationDocumentUrl(newLicenseUrl);
            } catch (Exception e) {
                log.error("Failed to move license for {}", institution.getInstitutionId(), e);
                institution.setVerificationDocumentUrl(pending.getVerificationDocumentUrl());
            }
            
            institution.setAccountStatus("PENDING");

            if (superAdminId != null) {
                SuperAdmin admin = superAdminRepository.findById(superAdminId).orElse(null);
                institution.setLinkedSuperAdmin(admin);
            }

            Institution saved;
            java.util.Optional<Institution> existingMock = institutionRepository.findById(institution.getInstitutionId());
            if (existingMock.isPresent()) {
                Institution mock = existingMock.get();
                mock.setInstitutionName(institution.getInstitutionName());
                mock.setOfficialEmail(institution.getOfficialEmail());
                mock.setInstitutionType(institution.getInstitutionType());
                mock.setSectorType(institution.getSectorType());
                mock.setPrimaryOfficerName(institution.getPrimaryOfficerName());
                mock.setOfficerDesignation(institution.getOfficerDesignation());
                mock.setPhoneCountryCode(institution.getPhoneCountryCode());
                mock.setPhoneNumber(institution.getPhoneNumber());
                mock.setAddressLine1(institution.getAddressLine1());
                mock.setAddressLine2(institution.getAddressLine2());
                mock.setCity(institution.getCity());
                mock.setState(institution.getState());
                mock.setCountry(institution.getCountry());
                mock.setPinCode(institution.getPinCode());
                mock.setInstitutionLogoUrl(institution.getInstitutionLogoUrl());
                mock.setVerificationDocumentUrl(institution.getVerificationDocumentUrl());
                mock.setAccountStatus(institution.getAccountStatus());
                mock.setLinkedSuperAdmin(institution.getLinkedSuperAdmin());
                saved = institutionRepository.save(mock);
            } else {
                saved = institutionRepository.save(institution);
            }
            
            // Delete from pending table
            pendingRepo.delete(pending);

            try {
                String token = jwtUtils.generateActivationToken(saved.getOfficialEmail());
                String activateLink = "http://localhost:5173/activate-account/institution?token=" + token + "&id=" + saved.getInstitutionId() + "&email=" + saved.getOfficialEmail();
                emailService.sendInstitutionApprovalEmail(saved.getOfficialEmail(), saved.getInstitutionName(), activateLink);
            } catch (Exception e) {
                log.error("Failed to send approval email to {}", saved.getOfficialEmail(), e);
            }

            log.info("✅ Institution APPROVED: {} — {}", saved.getInstitutionId(), saved.getInstitutionName());
            return saved;
        } else {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required.");
            }
            
            // Delete from pending table
            pendingRepo.delete(pending);

            try {
                if (pending.getInstitutionLogoUrl() != null) {
                    storageService.deleteFileByUrl(pending.getInstitutionLogoUrl(), "FEIRS-Bucket");
                }
                if (pending.getVerificationDocumentUrl() != null) {
                    storageService.deleteFileByUrl(pending.getVerificationDocumentUrl(), "FEIRS-Bucket");
                }
            } catch (Exception e) {
                log.error("Failed to delete storage files for rejected institution {}", pending.getRegistrationId(), e);
            }

            try {
                emailService.sendInstitutionRejectionEmail(pending.getOfficialEmail(), pending.getInstitutionName(), rejectionReason);
            } catch (Exception e) {
                log.error("Failed to send rejection email to {}", pending.getOfficialEmail(), e);
            }

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

    private String generateRegistrationId() {
        PendingInstitutionRegistration top = pendingRepo.findFirstByOrderByRegistrationIdDesc();
        if (top == null || top.getRegistrationId() == null || !top.getRegistrationId().startsWith("FEIRS-REG-")) {
            return "FEIRS-REG-0001";
        }
        try {
            int num = Integer.parseInt(top.getRegistrationId().replace("FEIRS-REG-", ""));
            return String.format("FEIRS-REG-%04d", num + 1);
        } catch (Exception e) {
            return "FEIRS-REG-0001";
        }
    }

    private String generateInstitutionId() {
        Institution top = institutionRepository.findFirstByOrderByInstitutionIdDesc();
        if (top == null || top.getInstitutionId() == null || !top.getInstitutionId().startsWith("FEIRS-INST-")) {
            return "FEIRS-INST-0001";
        }
        try {
            // Find the last 4 digits
            String idStr = top.getInstitutionId();
            String last4 = idStr.substring(idStr.length() - 4);
            int num = Integer.parseInt(last4);
            return String.format("FEIRS-INST-%04d", num + 1);
        } catch (Exception e) {
            return "FEIRS-INST-0001";
        }
    }
}
