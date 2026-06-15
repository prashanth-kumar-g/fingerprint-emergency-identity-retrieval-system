package com.feirs.backend.citizen;

import com.feirs.backend.models.Citizen;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for the biometric citizen lifecycle.
 *
 * These are the lifesaving endpoints — they process heavy biometric payloads,
 * integrate with the Mantra MFS 110 scanner, and manage medical profiles.
 *
 * Per Rest APIs Plan.pdf Section 5 — Biometric Core & Citizens:
 *   POST   /api/v1/citizens/enroll           — OPERATOR
 *   POST   /api/v1/citizens/emergency-scan    — OPERATOR
 *   GET    /api/v1/citizens/{id}              — OPERATOR
 *   PUT    /api/v1/citizens/{id}              — OPERATOR
 *   PUT    /api/v1/citizens/{id}/status       — OPERATOR
 */
@RestController
@RequestMapping("/api/v1/citizens")
@CrossOrigin(origins = "*")
public class CitizenController {

    private static final Logger log = LoggerFactory.getLogger(CitizenController.class);

    private final CitizenService citizenService;

    public CitizenController(CitizenService citizenService) {
        this.citizenService = citizenService;
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Enroll Citizen
    //  POST /api/v1/citizens/enroll?institutionId=FEIRS-INST-XXXX
    // ═══════════════════════════════════════════════════════════════

    /**
     * Enrolls a new citizen with demographic details, medical profile,
     * and biometric fingerprint data captured via Mantra MFS 110.
     *
     * Request body: Citizen fields including fingerprint_bmp_base64
     *               and fingerprint_iso_template (both REQUIRED).
     */
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestParam String institutionId,
                                     @RequestBody Citizen citizen) {
        try {
            Citizen saved = citizenService.enroll(institutionId, citizen);
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Citizen enrolled successfully.",
                "citizenId", saved.getCitizenId(),
                "citizen", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Enrollment error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error during enrollment."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Emergency Scan (Lifesaving 1:N Identification)
    //  POST /api/v1/citizens/emergency-scan
    // ═══════════════════════════════════════════════════════════════

    /**
     * Emergency biometric identification for unconscious/unresponsive patients.
     *
     * An Operator scans the patient's fingerprint using the Mantra MFS 110.
     * The ISO template is sent here → matched against ALL active citizens →
     * the full medical profile (blood type, allergies, conditions) is returned
     * instantly for first responders.
     *
     * Request body: { "isoTemplate": "<base64 ISO FMR template>" }
     */
    @PostMapping("/emergency-scan")
    public ResponseEntity<?> emergencyScan(@RequestBody Map<String, String> body) {
        try {
            String isoTemplate = body.get("isoTemplate");

            if (isoTemplate == null || isoTemplate.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "found", false,
                    "error", "isoTemplate is required for emergency scan."
                ));
            }

            Map<String, Object> result = citizenService.emergencyScan(isoTemplate.trim());

            if ((boolean) result.get("found")) {
                log.info("🚨 EMERGENCY SCAN — MATCH FOUND: {}",
                        result.get("citizenId"));
            } else {
                log.info("❌ Emergency scan — no match found.");
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Emergency scan error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "found", false,
                "error", "Internal server error during emergency scan."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Retrieve Citizen Profile
    //  GET /api/v1/citizens/{id}
    // ═══════════════════════════════════════════════════════════════

    @GetMapping("/{id}")
    public ResponseEntity<?> getCitizen(@PathVariable String id) {
        try {
            Citizen citizen = citizenService.getById(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "citizen", citizen
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Update Citizen Profile
    //  PUT /api/v1/citizens/{id}
    // ═══════════════════════════════════════════════════════════════

    /**
     * Updates a citizen's demographic, medical, or contact details.
     * In production, this strictly requires the citizen to authenticate
     * via fingerprint scan first.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCitizen(@PathVariable String id,
                                            @RequestBody Citizen updates) {
        try {
            Citizen updated = citizenService.update(id, updates);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Citizen profile updated.",
                "citizen", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Update citizen error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error updating citizen."
            ));
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATOR — Tombstone Citizen (Profile Deletion)
    //  PUT /api/v1/citizens/{id}/status
    // ═══════════════════════════════════════════════════════════════

    /**
     * Tombstones a citizen's profile — flips account_status to DELETED,
     * wipes all PII fields, but permanently retains biometric hashes to
     * prevent future "Biometric Collisions."
     *
     * Request body: { "status": "DELETED" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> setCitizenStatus(@PathVariable String id,
                                               @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            if (!"DELETED".equalsIgnoreCase(newStatus)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Only 'DELETED' status is supported for citizens (tombstoning)."
                ));
            }

            Citizen tombstoned = citizenService.tombstone(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Citizen profile tombstoned. Biometric hashes preserved "
                    + "to prevent future collisions.",
                "citizen", tombstoned
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Tombstone error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error during profile deletion."
            ));
        }
    }
}
