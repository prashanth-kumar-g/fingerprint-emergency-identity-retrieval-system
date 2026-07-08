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
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.feirs.backend.security.services.EmailService;
import com.feirs.backend.models.EmergencyContact;
import com.feirs.backend.repositories.EmergencyContactRepository;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Transactional
public class CitizenService {

    private static final Logger log = LoggerFactory.getLogger(CitizenService.class);
    private static final String ID_PREFIX = "FEIRS-CIT";

    private final CitizenRepository citizenRepository;
    private final OperatorRepository operatorRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final FingerprintService fingerprintService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    // In-memory cache for OTPs: key = operatorId, value = Map(otp, citizenDataJson)
    // In production, use Redis
    private final Map<String, Map<String, Object>> pendingEnrollments = new ConcurrentHashMap<>();

    public CitizenService(CitizenRepository citizenRepository,
                           OperatorRepository operatorRepository,
                           EmergencyContactRepository emergencyContactRepository,
                           FingerprintService fingerprintService,
                           EmailService emailService) {
        this.citizenRepository = citizenRepository;
        this.operatorRepository = operatorRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.fingerprintService = fingerprintService;
        this.emailService = emailService;
    }

    public void initiateEnrollment(String operatorId, String emailAddress, String citizenName) throws Exception {
        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + operatorId));

        String otp = String.format("%06d", new Random().nextInt(999999));
        Map<String, Object> data = new HashMap<>();
        data.put("otp", otp);
        data.put("email", emailAddress);
        data.put("timestamp", System.currentTimeMillis());

        pendingEnrollments.put(operatorId, data);
        
        log.info("=========================================================");
        log.info("CITIZEN ENROLLMENT OTP (USE THIS IF EMAIL FAILS): {}", otp);
        log.info("=========================================================");
        
        try {
            emailService.sendCitizenEnrollmentOtp(emailAddress, otp, citizenName);
            log.info("OTP sent for citizen enrollment by operator: {}", operatorId);
        } catch (Exception e) {
            log.warn("Google SMTP failed to send email (Timeout/Rate Limit). Proceeding anyway so user can use the OTP printed above. Error: {}", e.getMessage());
            // We swallow the exception here so the frontend can proceed to the OTP verification screen.
        }
    }

    @Transactional
    public Citizen verifyAndEnroll(String operatorId, String otp, String citizenJson, String contactsJson, MultipartFile livePhoto, MultipartFile medicalReport, String fingerprintBmpBase64, String fingerprintIsoTemplate) throws Exception {
        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new IllegalArgumentException("Operator not found: " + operatorId));

        Map<String, Object> data = pendingEnrollments.get(operatorId);
        if (data == null || !otp.equals(data.get("otp"))) {
            throw new IllegalArgumentException("Invalid OTP or no pending enrollment.");
        }
        if (System.currentTimeMillis() - (long) data.get("timestamp") > 10 * 60 * 1000) {
            pendingEnrollments.remove(operatorId);
            throw new IllegalArgumentException("OTP expired.");
        }

        if (fingerprintIsoTemplate == null || fingerprintIsoTemplate.isBlank()) {
            throw new IllegalArgumentException("Fingerprint ISO template is required for enrollment.");
        }
        if (fingerprintBmpBase64 == null || fingerprintBmpBase64.isBlank()) {
            throw new IllegalArgumentException("Fingerprint BMP base64 is required for enrollment.");
        }

        Citizen citizen = objectMapper.readValue(citizenJson, Citizen.class);
        citizen.setCitizenId(generateCitizenId());
        citizen.setEnrollingOperator(operator);
        citizen.setAccountStatus("ACTIVE");
        citizen.setFingerprintIsoTemplate(fingerprintIsoTemplate);
        citizen.setFingerprintBmpBase64(fingerprintBmpBase64);

        // Handle file uploads
        String uploadDir = "uploads/citizens/" + citizen.getCitizenId();
        Path absoluteUploadDir = Paths.get(uploadDir).toAbsolutePath();
        Files.createDirectories(absoluteUploadDir);

        if (livePhoto != null && !livePhoto.isEmpty()) {
            String fileName = "live_photo_" + livePhoto.getOriginalFilename();
            Path filePath = absoluteUploadDir.resolve(fileName);
            livePhoto.transferTo(filePath.toFile());
            citizen.setLivePhotoUrl((uploadDir + "/" + fileName).replace("\\", "/"));
        }

        if (medicalReport != null && !medicalReport.isEmpty()) {
            String fileName = "medical_report_" + medicalReport.getOriginalFilename();
            Path filePath = absoluteUploadDir.resolve(fileName);
            medicalReport.transferTo(filePath.toFile());
            citizen.setMedicalDocumentsUrl((uploadDir + "/" + fileName).replace("\\", "/"));
        }

        Citizen savedCitizen = citizenRepository.save(citizen);

        // Parse and save emergency contacts
        if (contactsJson != null && !contactsJson.isBlank()) {
            EmergencyContact[] contacts = objectMapper.readValue(contactsJson, EmergencyContact[].class);
            int count = 1;
            for (EmergencyContact contact : contacts) {
                if (contact.getContactName() != null && !contact.getContactName().isBlank()) {
                    contact.setContactId(savedCitizen.getCitizenId() + "-EC-" + count++);
                    contact.setCitizen(savedCitizen);
                    emergencyContactRepository.save(contact);
                }
            }
        }

        pendingEnrollments.remove(operatorId);
        log.info("✅ Citizen enrolled: {} — {} by operator {}",
                savedCitizen.getCitizenId(), savedCitizen.getFullName(), operatorId);
        return savedCitizen;
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
                        
                List<EmergencyContact> contacts = emergencyContactRepository.findByCitizen_CitizenId(citizen.getCitizenId());
                
                // Dispatch alerts
                for (EmergencyContact contact : contacts) {
                    if (contact.getEmailAddress() != null && !contact.getEmailAddress().isBlank()) {
                        try {
                            emailService.sendEmergencyAlertToContact(contact.getEmailAddress(), contact.getContactName(), citizen.getFullName());
                            log.info("Dispatched emergency alert to {}", contact.getEmailAddress());
                        } catch (Exception e) {
                            log.warn("Failed to dispatch emergency alert to {}: {}", contact.getEmailAddress(), e.getMessage());
                        }
                    }
                }
                
                return Map.of(
                        "found", true,
                        "citizenId", citizen.getCitizenId(),
                        "citizen", citizen,
                        "contacts", contacts
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

    @Transactional(readOnly = true)
    public Map<String, Object> getProfileWithContactsById(String citizenId) {
        Citizen citizen = getById(citizenId);
        List<EmergencyContact> contacts = emergencyContactRepository.findByCitizen_CitizenId(citizenId);
        return Map.of(
            "citizen", citizen,
            "contacts", contacts
        );
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

    private synchronized String generateCitizenId() {
        Optional<Citizen> lastCitizen = citizenRepository.findTopByOrderByCitizenIdDesc();
        int nextId = 1;
        if (lastCitizen.isPresent()) {
            String lastId = lastCitizen.get().getCitizenId();
            try {
                nextId = Integer.parseInt(lastId.substring(ID_PREFIX.length() + 1)) + 1;
            } catch (Exception e) {
                log.error("Failed to parse last citizen ID: {}", lastId);
            }
        }
        return String.format("%s-%04d", ID_PREFIX, nextId);
    }
}
