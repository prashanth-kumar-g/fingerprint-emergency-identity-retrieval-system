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

    @PostMapping(value = "/register", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @ModelAttribute PendingInstitutionRegistration registration,
            @RequestPart(value = "logoFile", required = false) org.springframework.web.multipart.MultipartFile logoFile,
            @RequestPart(value = "licenseFile", required = true) org.springframework.web.multipart.MultipartFile licenseFile) {
        try {
            PendingInstitutionRegistration saved = institutionService.register(registration, logoFile, licenseFile);
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

    @PutMapping("/profile/email")
    public ResponseEntity<?> updateEmail(
            @RequestParam String institutionId,
            @RequestBody Map<String, String> payload) {
        try {
            String newEmail = payload.get("newEmail");
            String currentPassword = payload.get("password");
            
            Institution updated = institutionService.updateEmail(institutionId, newEmail, currentPassword);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email updated successfully.",
                "institution", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile/password")
    public ResponseEntity<?> updatePassword(
            @RequestParam String institutionId,
            @RequestBody Map<String, String> payload) {
        try {
            String oldPassword = payload.get("oldPassword");
            String newPassword = payload.get("newPassword");
            
            institutionService.updatePassword(institutionId, oldPassword, newPassword);
            return ResponseEntity.ok("Password updated successfully.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadPhoto(
            @RequestParam String institutionId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String publicUrl = institutionService.uploadLogo(institutionId, file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Photo uploaded successfully.",
                "url", publicUrl
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Failed to upload photo for institution: {}", institutionId, e);
            return ResponseEntity.internalServerError().body("Failed to upload photo: " + e.getMessage());
        }
    }
}
