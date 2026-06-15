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

    public OperatorService(OperatorRepository operatorRepository,
                           InstitutionRepository institutionRepository) {
        this.operatorRepository = operatorRepository;
        this.institutionRepository = institutionRepository;
    }

    // ═══════════════════════════════════════════════════════════════
    //  INSTITUTION ADMIN — Add Operator
    //  POST /api/v1/operators
    // ═══════════════════════════════════════════════════════════════

    /**
     * Institution Admin onboards a new frontline staff member.
     * The operator's password_hash is left null — it is set by the Operator
     * themselves when they click the email activation link.
     *
     * @param institutionId The admin's institution (auto-linked, not from form)
     * @param operator      The operator details filled in by the admin
     * @return Saved operator with generated ID
     */
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
        operator.setAccountStatus("ACTIVE");
        operator.setLastLoginAt(null);

        // HR-managed fields are supplied by admin in the request body
        // Self-service fields (address, personal phone) default to null

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
        if (updates.getPhoneCountryCode() != null)
            existing.setPhoneCountryCode(updates.getPhoneCountryCode());
        if (updates.getPhoneNumber() != null)
            existing.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getAddressLine1() != null)
            existing.setAddressLine1(updates.getAddressLine1());
        if (updates.getAddressLine2() != null)
            existing.setAddressLine2(updates.getAddressLine2());
        if (updates.getCity() != null)
            existing.setCity(updates.getCity());
        if (updates.getState() != null)
            existing.setState(updates.getState());
        if (updates.getCountry() != null)
            existing.setCountry(updates.getCountry());
        if (updates.getPinCode() != null)
            existing.setPinCode(updates.getPinCode());
        if (updates.getProfilePhotoUrl() != null)
            existing.setProfilePhotoUrl(updates.getProfilePhotoUrl());

        Operator saved = operatorRepository.save(existing);
        log.info("✅ Operator {} updated their self-service profile", operatorId);
        return saved;
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
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return ID_PREFIX + "-" + suffix;
    }
}
