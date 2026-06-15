package com.feirs.backend.citizen;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feirs.backend.models.Citizen;
import com.feirs.backend.models.Institution;
import com.feirs.backend.repositories.CitizenRepository;
import com.feirs.backend.repositories.InstitutionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

/**
 * Business logic for the Citizen biometric lifecycle — enrollment,
 * emergency identification, profile management, and tombstoning.
 *
 * This is the lifesaving core of the FEIRS platform.
 * Per Operator Plan.pdf + Rest APIs Plan.pdf Section 5.
 */
@Service
@Transactional
public class CitizenService {

    private static final Logger log = LoggerFactory.getLogger(CitizenService.class);
    private static final String ID_PREFIX = "FEIRS-CIT";
    private static final String MFS100_URL = "http://localhost:8004/mfs100";

    private final CitizenRepository citizenRepository;
    private final InstitutionRepository institutionRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public CitizenService(CitizenRepository citizenRepository,
                          InstitutionRepository institutionRepository) {
        this.citizenRepository = citizenRepository;
        this.institutionRepository = institutionRepository;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Enroll Citizen
    //  POST /api/v1/citizens/enroll
    // ═══════════════════════════════════════════════════════════════

    /**
     * Enrolls a new citizen with demographic details, medical profile,
     * and biometric fingerprint data captured via Mantra MFS 110.
     *
     * The enrolling_institution_id is permanently stamped (NOT NULL)
     * per Database Tables Correction Plan.pdf.
     *
     * Biometric fields (fingerprint_bmp_base64, fingerprint_iso_template)
     * are NOT NULL — they are the permanent identity anchor.
     */
    public Citizen enroll(String institutionId, Citizen citizen) {
        Institution institution = institutionRepository.findById(institutionId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Institution not found: " + institutionId));

        // Validate required biometric fields
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
        citizen.setEnrollingInstitution(institution);
        citizen.setAccountStatus("ACTIVE");

        Citizen saved = citizenRepository.save(citizen);
        log.info("✅ Citizen enrolled: {} — {} at institution {}",
                saved.getCitizenId(), saved.getFullName(), institutionId);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Emergency Scan (Lifesaving 1:N Identification)
    //  POST /api/v1/citizens/emergency-scan
    // ═══════════════════════════════════════════════════════════════

    /**
     * Performs a 1:N biometric identification against all ACTIVE citizens.
     *
     * This is the lifesaving endpoint — an unconscious patient's fingerprint
     * is scanned, matched against the global citizen pool, and their full
     * medical profile (blood type, allergies, conditions, emergency contacts)
     * is instantly returned to the first responder.
     *
     * Matching is performed via the Mantra MFS 100 /verify endpoint,
     * comparing the probe template against each stored gallery template.
     *
     * @param probeIsoTemplate The ISO FMR template captured from the patient
     * @return Map with "found" (boolean) + citizen profile if matched
     */
    @Transactional(readOnly = true)
    public Map<String, Object> emergencyScan(String probeIsoTemplate) {
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

            try {
                boolean matched = verifyFingerprint(
                        probeIsoTemplate, citizen.getFingerprintIsoTemplate());

                if (matched) {
                    log.info("🚨 MATCH FOUND: Citizen {} — {}",
                            citizen.getCitizenId(), citizen.getFullName());

                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("found", true);
                    result.put("citizenId", citizen.getCitizenId());
                    result.put("fullName", citizen.getFullName());
                    result.put("dateOfBirth", citizen.getDateOfBirth() != null
                            ? citizen.getDateOfBirth().toString() : null);
                    result.put("gender", citizen.getGender());
                    result.put("bloodGroup", citizen.getBloodGroup());
                    result.put("chronicConditions", citizen.getChronicConditions());
                    result.put("severeAllergies", citizen.getSevereAllergies());
                    result.put("currentMedications", citizen.getCurrentMedications());
                    result.put("livePhotoUrl", citizen.getLivePhotoUrl());
                    result.put("accountStatus", citizen.getAccountStatus());

                    // TODO Step 7: Fetch and include emergency_contacts for alerts
                    return result;
                }
            } catch (Exception e) {
                log.warn("Verify error for citizen {}: {}", citizen.getCitizenId(), e.getMessage());
            }
        }

        log.info("❌ No match found among {} active citizens.", activeCitizens.size());
        return Map.of("found", false,
            "message", "No matching fingerprint found. Patient may not be enrolled.");
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Retrieve Citizen Profile
    //  GET /api/v1/citizens/{id}
    // ═══════════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public Citizen getById(String citizenId) {
        return citizenRepository.findById(citizenId)
                .orElseThrow(() -> new IllegalArgumentException(
                    "Citizen not found: " + citizenId));
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Update Citizen Profile
    //  PUT /api/v1/citizens/{id}
    // ═══════════════════════════════════════════════════════════════

    /**
     * Updates a citizen's demographic, medical, or contact details.
     * In production, this strictly requires fingerprint authentication first.
     */
    public Citizen update(String citizenId, Citizen updates) {
        Citizen existing = getById(citizenId);

        // Demographics
        if (updates.getFullName() != null) existing.setFullName(updates.getFullName());
        if (updates.getDateOfBirth() != null) existing.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getGender() != null) existing.setGender(updates.getGender());

        // Contact
        if (updates.getPhoneCountryCode() != null) existing.setPhoneCountryCode(updates.getPhoneCountryCode());
        if (updates.getPhoneNumber() != null) existing.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getEmailAddress() != null) existing.setEmailAddress(updates.getEmailAddress());
        if (updates.getAddressLine1() != null) existing.setAddressLine1(updates.getAddressLine1());
        if (updates.getAddressLine2() != null) existing.setAddressLine2(updates.getAddressLine2());
        if (updates.getCity() != null) existing.setCity(updates.getCity());
        if (updates.getState() != null) existing.setState(updates.getState());
        if (updates.getCountry() != null) existing.setCountry(updates.getCountry());
        if (updates.getPinCode() != null) existing.setPinCode(updates.getPinCode());

        // Medical
        if (updates.getBloodGroup() != null) existing.setBloodGroup(updates.getBloodGroup());
        if (updates.getChronicConditions() != null) existing.setChronicConditions(updates.getChronicConditions());
        if (updates.getSevereAllergies() != null) existing.setSevereAllergies(updates.getSevereAllergies());
        if (updates.getCurrentMedications() != null) existing.setCurrentMedications(updates.getCurrentMedications());
        if (updates.getMedicalDocumentsUrl() != null) existing.setMedicalDocumentsUrl(updates.getMedicalDocumentsUrl());

        // Photo
        if (updates.getLivePhotoUrl() != null) existing.setLivePhotoUrl(updates.getLivePhotoUrl());

        // Biometric fields should NOT be updated via this method —
        // they require a dedicated re-enrollment flow with fresh fingerprint capture.

        Citizen saved = citizenRepository.save(existing);
        log.info("✅ Citizen {} profile updated", citizenId);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Tombstone Citizen (Profile Deletion)
    //  PUT /api/v1/citizens/{id}/status
    // ═══════════════════════════════════════════════════════════════

    /**
     * Tombstones a citizen's profile — flips account_status to DELETED
     * and wipes all PII fields while preserving biometric hashes.
     *
     * This prevents "Biometric Collisions": if the citizen tries to re-enroll
     * later, the system detects their fingerprint still exists (tombstoned)
     * and triggers a "Profile Reactivation" prompt instead of a duplicate.
     */
    public Citizen tombstone(String citizenId) {
        Citizen citizen = getById(citizenId);

        // Wipe all PII fields for data privacy compliance
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
        citizen.setBloodGroup(null);
        citizen.setChronicConditions(null);
        citizen.setSevereAllergies(null);
        citizen.setCurrentMedications(null);
        citizen.setMedicalDocumentsUrl(null);
        citizen.setLivePhotoUrl(null);

        // Biometric hashes are NEVER wiped — they prevent future collisions
        // fingerprint_bmp_base64 and fingerprint_iso_template remain intact

        citizen.setAccountStatus("DELETED");
        Citizen saved = citizenRepository.save(citizen);
        log.info("🪦 Citizen {} tombstoned (DELETED). Biometric hashes preserved.", citizenId);
        return saved;
    }

    // ═══════════════════════════════════════════════════════════════
    //  MFS 100 Fingerprint Verification (1:1 Matching)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Calls the Mantra MFS 100 /verify endpoint to compare two ISO templates.
     * Same proven logic as FingerprintService.callMFS100Verify().
     *
     * @param probeTemplate   The freshly captured fingerprint template
     * @param galleryTemplate The stored template from the database
     * @return true if the fingerprints match
     */
    @SuppressWarnings("unchecked")
    private boolean verifyFingerprint(String probeTemplate, String galleryTemplate) {
        try {
            HttpURLConnection conn = (HttpURLConnection)
                new URL(MFS100_URL + "/verify").openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(5000);

            Map<String, String> body = new LinkedHashMap<>();
            body.put("ProbTemplate", probeTemplate);
            body.put("GalleryTemplate", galleryTemplate);
            body.put("BioType", "FMR");

            conn.getOutputStream().write(mapper.writeValueAsBytes(body));

            int code = conn.getResponseCode();
            InputStream is = (code == 200) ? conn.getInputStream() : conn.getErrorStream();
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = r.readLine()) != null) sb.append(line);
            }
            conn.disconnect();

            Map<String, Object> resp = mapper.readValue(sb.toString(), Map.class);

            // Parse ErrorCode safely
            int errorCode;
            Object errObj = resp.getOrDefault("ErrorCode", "-1");
            try {
                errorCode = Integer.parseInt(errObj.toString().trim());
            } catch (NumberFormatException e) {
                errorCode = -1;
            }

            // Parse Status safely
            Object statusObj = resp.get("Status");
            boolean matched;
            if (statusObj instanceof Boolean) {
                matched = (Boolean) statusObj;
            } else {
                matched = "true".equalsIgnoreCase(String.valueOf(statusObj));
            }

            Object score = resp.get("Score");
            log.debug("Verify → ErrorCode={} Matched={} Score={}", errorCode, matched, score);

            return errorCode == 0 && matched;

        } catch (Exception e) {
            log.error("MFS100 verify error: {}", e.getMessage());
            return false;
        }
    }

    // ── ID Generation ───────────────────────────────────────────

    private String generateCitizenId() {
        String suffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return ID_PREFIX + "-" + suffix;
    }
}
