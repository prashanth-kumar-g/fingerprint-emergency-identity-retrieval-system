package com.feirs.backend.citizen;

import com.feirs.backend.fingerprint.FingerprintService;
import com.feirs.backend.models.Citizen;
import com.feirs.backend.models.Operator;
import com.feirs.backend.repositories.CitizenRepository;
import com.feirs.backend.repositories.OperatorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class CitizenService {

    private static final Logger log = LoggerFactory.getLogger(CitizenService.class);
    private static final String ID_PREFIX = "FEIRS-CIT";

    private final CitizenRepository citizenRepository;
    private final OperatorRepository operatorRepository;
    private final FingerprintService fingerprintService;

    public CitizenService(CitizenRepository citizenRepository,
                           OperatorRepository operatorRepository,
                           FingerprintService fingerprintService) {
        this.citizenRepository = citizenRepository;
        this.operatorRepository = operatorRepository;
        this.fingerprintService = fingerprintService;
    }

    public Citizen enroll(String operatorId, Citizen citizen) {
        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Operator not found: " + operatorId));

        if (citizen.getFingerprintIsoTemplate() == null
                || citizen.getFingerprintIsoTemplate().isBlank()) {
            throw new IllegalArgumentException(
                "Fingerprint ISO template is required for enrollment.");
        }
        if (citizen.getFingerprintBmpBase64() == null
                || citizen.getFingerprintBmpBase64().isBlank()) {
            throw new IllegalArgumentException(
                "Fingerprint BMP base64 is required for enrollment.");
        }

        citizen.setCitizenId(generateCitizenId());
        citizen.setEnrollingOperator(operator);
        citizen.setAccountStatus("ACTIVE");

        Citizen saved = citizenRepository.save(citizen);
        log.info("✅ Citizen enrolled: {} — {} by operator {}",
                saved.getCitizenId(), saved.getFullName(), operatorId);
        return saved;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> emergencyScan(String isoTemplateProbe) {
        if (isoTemplateProbe == null || isoTemplateProbe.isBlank()) {
            throw new IllegalArgumentException("Scan template probe is required.");
        }

        List<Citizen> activeCitizens = citizenRepository.findByAccountStatus("ACTIVE");

        if (activeCitizens.isEmpty()) {
            return Map.of("found", false,
                "message", "No citizens enrolled in the system yet.");
        }

        log.info("🔍 Emergency scan: matching probe against {} active citizens...",
                activeCitizens.size());

        for (Citizen citizen : activeCitizens) {
            if (citizen.getFingerprintIsoTemplate() == null
                    || citizen.getFingerprintIsoTemplate().isBlank()) {
                continue;
            }

            boolean isMatch = fingerprintService.matchTemplates(
                    isoTemplateProbe, citizen.getFingerprintIsoTemplate());

            if (isMatch) {
                log.info("🎯 MATCH FOUND! Patient identified as: {} ({})",
                        citizen.getFullName(), citizen.getCitizenId());
                return Map.of(
                        "found", true,
                        "citizenId", citizen.getCitizenId(),
                        "citizen", citizen
                );
            }
        }

        log.info("❌ No match found among {} active citizens.", activeCitizens.size());
        return Map.of("found", false,
            "message", "No matching fingerprint found. Patient may not be enrolled.");
    }

    @Transactional(readOnly = true)
    public Citizen getById(String citizenId) {
        return citizenRepository.findById(citizenId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Citizen not found: " + citizenId));
    }

    public Citizen update(String citizenId, Citizen updates) {
        Citizen existing = getById(citizenId);

        if (updates.getFullName() != null) existing.setFullName(updates.getFullName());
        if (updates.getDateOfBirth() != null) existing.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) existing.setGender(updates.getGender());
        if (updates.getPhoneCountryCode() != null) existing.setPhoneCountryCode(updates.getPhoneCountryCode());
        if (updates.getPhoneNumber() != null) existing.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getEmailAddress() != null) existing.setEmailAddress(updates.getEmailAddress());
        if (updates.getAddressLine1() != null) existing.setAddressLine1(updates.getAddressLine1());
        if (updates.getAddressLine2() != null) existing.setAddressLine2(updates.getAddressLine2());
        if (updates.getCity() != null) existing.setCity(updates.getCity());
        if (updates.getState() != null) existing.setState(updates.getState());
        if (updates.getCountry() != null) existing.setCountry(updates.getCountry());
        if (updates.getPinCode() != null) existing.setPinCode(updates.getPinCode());

        if (updates.getBloodGroup() != null) existing.setBloodGroup(updates.getBloodGroup());
        if (updates.getChronicConditions() != null) existing.setChronicConditions(updates.getChronicConditions());
        if (updates.getSevereAllergies() != null) existing.setSevereAllergies(updates.getSevereAllergies());
        if (updates.getCurrentMedications() != null) existing.setCurrentMedications(updates.getCurrentMedications());
        if (updates.getMedicalDocumentsUrl() != null) existing.setMedicalDocumentsUrl(updates.getMedicalDocumentsUrl());
        if (updates.getLivePhotoUrl() != null) existing.setLivePhotoUrl(updates.getLivePhotoUrl());

        Citizen saved = citizenRepository.save(existing);
        log.info("✅ Citizen {} profile updated", citizenId);
        return saved;
    }

    public Citizen tombstone(String citizenId) {
        Citizen citizen = getById(citizenId);

        citizen.setFullName("REDACTED");
        citizen.setDateOfBirth(null);
        citizen.setGender(null);
        citizen.setPhoneCountryCode(null);
        citizen.setPhoneNumber(null);
        citizen.setEmailAddress(null);
        citizen.setAddressLine1(null);
        citizen.setAddressLine2(null);
        citizen.setCity(null);
        citizen.setState(null);
        citizen.setPinCode(null);
        
        citizen.setChronicConditions(null);
        citizen.setSevereAllergies(null);
        citizen.setCurrentMedications(null);
        citizen.setMedicalDocumentsUrl(null);
        citizen.setLivePhotoUrl(null);

        citizen.setAccountStatus("DELETED");

        Citizen saved = citizenRepository.save(citizen);
        log.info("☠️ Citizen {} tombstoned. PII wiped, biometrics retained.", citizenId);
        return saved;
    }

    private String generateCitizenId() {
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return ID_PREFIX + "-" + suffix;
    }
}
