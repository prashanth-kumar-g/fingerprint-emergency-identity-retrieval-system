package com.feirs.backend.institution;

import com.feirs.backend.changerequest.DataChangeRequestService;
import com.feirs.backend.models.Institution;
import com.feirs.backend.models.PendingInstitutionRegistration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/institutions")
@CrossOrigin(origins = "*")
public class InstitutionController {

    private static final Logger log = LoggerFactory.getLogger(InstitutionController.class);

    private final InstitutionService institutionService;
    private final DataChangeRequestService changeRequestService;

    public InstitutionController(InstitutionService institutionService,
                                  DataChangeRequestService changeRequestService) {
        this.institutionService = institutionService;
        this.changeRequestService = changeRequestService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody PendingInstitutionRegistration registration) {
        try {
            PendingInstitutionRegistration saved = institutionService.register(registration);
            log.info("📝 New institution registration: {}", saved.getInstitutionName());
            return ResponseEntity.status(201).body(Map.of(
                "success", true,
                "message", "Registration submitted successfully. Awaiting Super Admin approval.",
                "registrationId", saved.getRegistrationId(),
                "status", saved.getStatus()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Registration error: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "Internal server error during registration."
            ));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String institutionId) {
        try {
            Institution institution = institutionService.getById(institutionId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "institution", institution
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @PutMapping("/profile/self-service")
    public ResponseEntity<?> updateSelfService(
            @RequestParam String institutionId,
            @RequestBody Institution updates) {
        try {
            Institution saved = institutionService.updateSelfService(institutionId, updates);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Self-service fields updated successfully.",
                "institution", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/change-requests")
    public ResponseEntity<?> submitChangeRequest(
            @RequestParam String institutionId,
            @RequestBody Map<String, String> payload) {
        try {
            String fieldName = payload.get("fieldName");
            String proposedValue = payload.get("proposedValue");
            String documentUrl = payload.get("documentUrl");

            if (fieldName == null || proposedValue == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "fieldName and proposedValue are required."
                ));
            }

            institutionService.submitChangeRequest(institutionId, fieldName, proposedValue, documentUrl);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Change request submitted successfully. Awaiting Super Admin review."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
