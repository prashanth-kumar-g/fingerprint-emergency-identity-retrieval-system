package com.feirs.backend.operator;

import com.feirs.backend.models.Institution;
import com.feirs.backend.models.Operator;
import com.feirs.backend.repositories.InstitutionRepository;
import com.feirs.backend.repositories.OperatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.feirs.backend.security.services.EmailService;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.feirs.backend.security.jwt.JwtUtils;

/**
 * Business logic for Operator lifecycle — HR onboarding by Institution Admin,
 * self-service profile updates by the Operator, and status management.
 *
 * Per Operator Plan.pdf + Rest APIs Plan.pdf Section 4.
 */
@Service
@Transactional
public class OperatorService {

    private static final Logger log = LoggerFactory.getLogger(OperatorService.class);
    private static final String ID_PREFIX = "FEIRS-OP";

    private final OperatorRepository operatorRepository;
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.feirs.backend.config.SupabaseStorageService storageService;
    private final com.feirs.backend.security.services.EmailService emailService;
    private final JwtUtils jwtUtils;

    private final Map<String, String> operatorEnrollmentOtps = new ConcurrentHashMap<>();

    public OperatorService(OperatorRepository operatorRepository,
                           InstitutionRepository institutionRepository,
                           PasswordEncoder passwordEncoder,
                           com.feirs.backend.config.SupabaseStorageService storageService,
                           com.feirs.backend.security.services.EmailService emailService,
                           JwtUtils jwtUtils) {
        this.operatorRepository = operatorRepository;
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
        this.storageService = storageService;
        this.emailService = emailService;
        this.jwtUtils = jwtUtils;
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Add Operator
    //  POST /api/v1/operators
    // ═══════════════════════════════════════════════════════════════

    public String uploadPhoto(String operatorId, org.springframework.web.multipart.MultipartFile file) throws Exception {
        Operator existing = getById(operatorId);
        
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/jpg"))) {
            throw new IllegalArgumentException("Only JPG/PNG files are allowed.");
        }

        if (existing.getProfilePhotoUrl() != null) {
            storageService.deleteFileByUrl(existing.getProfilePhotoUrl(), "FEIRS-Bucket");
        }

        String publicUrl = storageService.uploadFile(file, "FEIRS-Bucket", "operator-photos/" + operatorId);
        existing.setProfilePhotoUrl(publicUrl);
        operatorRepository.save(existing);
        
        log.info("✅ Operator photo updated: {}", operatorId);
        return publicUrl;
    }

    /**
     * Institution Admin onboards a new frontline staff member.
     * The operator's password_hash is left null — it is set by the Operator
     * themselves when they click the email activation link.
     *
     * @param institutionId The admin's institution (auto-linked, not from form)
     * @param operator      The operator details filled in by the admin
     * @return Saved operator with generated ID
     */
    public void initiateEnrollment(Operator operator, String institutionId) throws Exception {
        if (operatorRepository.existsByOfficialEmail(operator.getOfficialEmail())) {
            throw new IllegalArgumentException("An operator with this official email already exists: " + operator.getOfficialEmail());
        }

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException("Institution not found: " + institutionId));

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        operatorEnrollmentOtps.put(operator.getOfficialEmail(), otp);
        
        emailService.sendOperatorEnrollmentOtp(
            operator.getOfficialEmail(), 
            otp, 
            operator.getFullName(), 
            institution.getInstitutionName()
        );
        log.info("OTP sent to {} for enrollment", operator.getOfficialEmail());
    }

    public void initiateHrUpdate(String operatorId, Operator updates) throws Exception {
        Operator existing = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + operatorId));

        if (updates.getOfficialEmail() != null && !updates.getOfficialEmail().equalsIgnoreCase(existing.getOfficialEmail())) {
            if (operatorRepository.existsByOfficialEmail(updates.getOfficialEmail())) {
                throw new IllegalArgumentException("An operator with this official email already exists.");
            }
        }

        String targetEmail = updates.getOfficialEmail() != null ? updates.getOfficialEmail() : existing.getOfficialEmail();
        String targetName = updates.getFullName() != null ? updates.getFullName() : existing.getFullName();

        Institution institution = existing.getInstitution();
        String institutionName = institution != null ? institution.getInstitutionName() : "Institution";

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        operatorEnrollmentOtps.put(targetEmail, otp);
        
        emailService.sendOperatorHrUpdateOtp(
            targetEmail, 
            otp, 
            targetName, 
            institutionName
        );
        log.info("OTP sent to {} for HR update verification", targetEmail);
    }

    public Operator verifyHrUpdate(String otp, String operatorId, Operator updates) throws Exception {
        Operator existing = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + operatorId));

        String targetEmail = updates.getOfficialEmail() != null ? updates.getOfficialEmail() : existing.getOfficialEmail();

        String savedOtp = operatorEnrollmentOtps.get(targetEmail);
        if (savedOtp == null || !savedOtp.equals(otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }
        operatorEnrollmentOtps.remove(targetEmail);

        if (updates.getFullName() != null) existing.setFullName(updates.getFullName());
        if (updates.getDateOfBirth() != null) existing.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) existing.setGender(updates.getGender());
        if (updates.getOfficialEmail() != null) existing.setOfficialEmail(updates.getOfficialEmail());
        if (updates.getDepartment() != null) existing.setDepartment(updates.getDepartment());
        if (updates.getDesignationTitle() != null) existing.setDesignationTitle(updates.getDesignationTitle());

        log.info("✅ Operator HR records updated: {}", operatorId);
        return operatorRepository.save(existing);
    }

    public Operator verifyEnrollment(String otp, Operator operator, String institutionId, org.springframework.web.multipart.MultipartFile photoFile) throws Exception {
        String savedOtp = operatorEnrollmentOtps.get(operator.getOfficialEmail());
        if (savedOtp == null || !savedOtp.equals(otp)) {
            throw new IllegalArgumentException("Invalid or expired OTP.");
        }
        operatorEnrollmentOtps.remove(operator.getOfficialEmail());

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException("Institution not found: " + institutionId));

        operator.setOperatorId(generateOperatorId());
        operator.setInstitution(institution);
        operator.setPasswordHash(null);
        operator.setAccountStatus("PENDING");
        operator.setLastLoginAt(null);

        Operator saved = operatorRepository.save(operator);

        if (photoFile != null && !photoFile.isEmpty()) {
            uploadPhoto(saved.getOperatorId(), photoFile);
        }

        // Generate Activation Link
        String token = jwtUtils.generateActivationToken(saved.getOfficialEmail());
        String link = "http://localhost:5173/activate-account/operator?token=" + token + "&id=" + saved.getOperatorId();

        emailService.sendOperatorActivationEmail(
            saved.getOfficialEmail(), 
            saved.getFullName(), 
            link, 
            institution.getInstitutionName()
        );

        log.info("✅ Operator created and verified: {}", saved.getOperatorId());
        return saved;
    }

    public Operator createOperator(String institutionId, Operator operator) {
        if (operatorRepository.existsByOfficialEmail(operator.getOfficialEmail())) {
            throw new IllegalArgumentException(
                "An operator with this official email already exists: "
                + operator.getOfficialEmail());
        }

        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Institution not found: " + institutionId));

        operator.setOperatorId(generateOperatorId());
        operator.setInstitution(institution);
        operator.setPasswordHash(null);     // Operator sets password after activation
        operator.setAccountStatus("PENDING");
        operator.setLastLoginAt(null);

        Operator saved = operatorRepository.save(operator);
        log.info("✅ Operator created: {} — {} at institution {}."
                + " TODO: Send activation email to {}",
                saved.getOperatorId(), saved.getFullName(),
                institutionId, saved.getOfficialEmail());
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — List Operators (Multi-Tenant)
    //  GET /api/v1/operators?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public List<Operator> getOperatorsByInstitution(String institutionId) {
        return operatorRepository.findByInstitution_InstitutionId(institutionId);
    }

    @Transactional(readOnly = true)
    public Operator getById(String operatorId) {
        return operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Operator not found: " + operatorId));
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — View Own Profile (Self-Service)
    //  GET /api/v1/operators/profile?operatorId=FEIRS-OP-XXXX
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Operator getProfile(String operatorId) {
        return getById(operatorId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Update Own Contact Info (Self-Service)
    //  PUT /api/v1/operators/profile?operatorId=FEIRS-OP-XXXX
    // ═══════════════════════════════════════════════════════════════

    /**
     * Operator updates their own self-service fields:
     * phone, address, profile photo. HR-managed fields (name, email,
     * department, title) are locked — only the Institution Admin can
     * change those via the admin dashboard.
     */
    public Operator updateProfile(String operatorId, Operator updates) {
        Operator existing = getById(operatorId);

        // Self-service writable fields only
        if (updates.getPhoneCountryCode() != null) {
            existing.setPhoneCountryCode(updates.getPhoneCountryCode());
        }
        if (updates.getPhoneNumber() != null) {
            existing.setPhoneNumber(updates.getPhoneNumber());
        }
        if (updates.getAddressLine1() != null) {
            existing.setAddressLine1(updates.getAddressLine1());
        }
        if (updates.getAddressLine2() != null) {
            existing.setAddressLine2(updates.getAddressLine2());
        }
        if (updates.getCity() != null) {
            existing.setCity(updates.getCity());
        }
        if (updates.getState() != null) {
            existing.setState(updates.getState());
        }
        if (updates.getCountry() != null) {
            existing.setCountry(updates.getCountry());
        }
        if (updates.getPinCode() != null) {
            existing.setPinCode(updates.getPinCode());
        }
        if (updates.getProfilePhotoUrl() != null) {
            existing.setProfilePhotoUrl(updates.getProfilePhotoUrl());
        }

        Operator saved = operatorRepository.save(existing);
        log.info("✅ Operator {} updated their self-service profile", operatorId);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Update Password
    // ═══════════════════════════════════════════════════════════════

    public void updatePassword(String operatorId, String oldPassword, String newPassword) {
        Operator existing = getById(operatorId);
        if (!passwordEncoder.matches(oldPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect old password.");
        }
        if (passwordEncoder.matches(newPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Old and new password cannot be the same.");
        }
        existing.setPasswordHash(passwordEncoder.encode(newPassword));
        operatorRepository.save(existing);
        log.info("✅ Operator password updated: {}", operatorId);
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Toggle Operator Status
    //  PUT /api/v1/operators/{id}/status
    // ═══════════════════════════════════════════════════════════════

    /**
     * Institution Admin toggles an operator's account_status.
     * SUSPENDED instantly revokes login without deleting historical scan logs.
     */
    public Operator setOperatorStatus(String operatorId, String newStatus) {
        if (!List.of("ACTIVE", "SUSPENDED").contains(newStatus)) {
            throw new IllegalArgumentException(
                "Invalid account status: " + newStatus + ". Must be ACTIVE or SUSPENDED.");
        }
        Operator operator = getById(operatorId);
        operator.setAccountStatus(newStatus);
        Operator saved = operatorRepository.save(operator);
        log.info("🔒 Operator {} account status set to: {}", operatorId, newStatus);
        return saved;
    }

    // ── ID Generation ───────────────────────────────────────────

    private String generateOperatorId() {
        Operator top = operatorRepository.findFirstByOrderByOperatorIdDesc();
        if (top == null) {
            return "FEIRS-OP-0001";
        }
        String lastId = top.getOperatorId();
        try {
            String last4 = lastId.substring(lastId.length() - 4);
            int num = Integer.parseInt(last4);
            return String.format("FEIRS-OP-%04d", num + 1);
        } catch (Exception e) {
            String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            return ID_PREFIX + "-" + suffix;
        }
    }
}

