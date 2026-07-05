package com.feirs.backend.superadmin;

import com.feirs.backend.config.SupabaseStorageService;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.SuperAdminRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/super-admin/profile")
public class SuperAdminProfileController {

    private final SuperAdminRepository superAdminRepository;
    private final SupabaseStorageService storageService;
    private final PasswordEncoder passwordEncoder;

    public SuperAdminProfileController(SuperAdminRepository superAdminRepository, 
                                       SupabaseStorageService storageService,
                                       PasswordEncoder passwordEncoder) {
        this.superAdminRepository = superAdminRepository;
        this.storageService = storageService;
        this.passwordEncoder = passwordEncoder;
    }

    private SuperAdmin getAuthenticatedAdmin(Authentication authentication) {
        String adminId = authentication.getName();
        return superAdminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Super Admin not found"));
    }

    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        return ResponseEntity.ok(getAuthenticatedAdmin(authentication));
    }

    @PutMapping("/info")
    public ResponseEntity<?> updateInfo(Authentication authentication, @RequestBody Map<String, String> payload) {
        SuperAdmin admin = getAuthenticatedAdmin(authentication);
        
        if (payload.containsKey("adminName")) admin.setAdminName(payload.get("adminName"));
        if (payload.containsKey("phoneCountryCode")) admin.setPhoneCountryCode(payload.get("phoneCountryCode"));
        if (payload.containsKey("phoneNumber")) admin.setPhoneNumber(payload.get("phoneNumber"));
        
        superAdminRepository.save(admin);
        return ResponseEntity.ok("Profile info updated successfully");
    }

    @PutMapping("/email")
    public ResponseEntity<?> updateEmail(Authentication authentication, @RequestBody Map<String, String> payload) {
        SuperAdmin admin = getAuthenticatedAdmin(authentication);
        String currentPassword = payload.get("password");
        String newEmail = payload.get("newEmail");

        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Incorrect password");
        }
        
        if (superAdminRepository.existsByMasterEmail(newEmail)) {
            return ResponseEntity.badRequest().body("Email is already in use");
        }

        admin.setMasterEmail(newEmail);
        superAdminRepository.save(admin);
        return ResponseEntity.ok("Email updated successfully");
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(Authentication authentication, @RequestBody Map<String, String> payload) {
        SuperAdmin admin = getAuthenticatedAdmin(authentication);
        String oldPassword = payload.get("oldPassword");
        String newPassword = payload.get("newPassword");

        if (!passwordEncoder.matches(oldPassword, admin.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Incorrect old password");
        }
        
        if (passwordEncoder.matches(newPassword, admin.getPasswordHash())) {
            return ResponseEntity.badRequest().body("Old and new password cannot be the same");
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        superAdminRepository.save(admin);
        return ResponseEntity.ok("Password updated successfully");
    }

    @PostMapping("/photo")
    public ResponseEntity<?> uploadPhoto(Authentication authentication, @RequestParam("file") MultipartFile file) {
        try {
            // Basic validation
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/jpg"))) {
                return ResponseEntity.badRequest().body("Only JPG/PNG files are allowed");
            }

            SuperAdmin admin = getAuthenticatedAdmin(authentication);

            // Delete old photo if it exists
            if (admin.getProfilePhotoUrl() != null) {
                storageService.deleteFileByUrl(admin.getProfilePhotoUrl(), "FEIRS-Bucket");
            }

            // Upload new photo
            String publicUrl = storageService.uploadFile(file, "FEIRS-Bucket", "superadmin-photos/" + admin.getSuperAdminId());
            
            // Save to DB
            admin.setProfilePhotoUrl(publicUrl);
            superAdminRepository.save(admin);

            return ResponseEntity.ok(Map.of("message", "Photo uploaded successfully", "url", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upload photo: " + e.getMessage());
        }
    }
}
