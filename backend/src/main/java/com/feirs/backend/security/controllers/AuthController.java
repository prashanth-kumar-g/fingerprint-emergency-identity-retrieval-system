package com.feirs.backend.security.controllers;

import com.feirs.backend.security.jwt.JwtUtils;
import com.feirs.backend.security.payload.JwtResponse;
import com.feirs.backend.security.payload.LoginRequest;
import com.feirs.backend.security.services.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

import com.feirs.backend.repositories.SuperAdminRepository;
import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.security.services.EmailService;
import com.feirs.backend.security.payload.ForgotPasswordRequest;
import com.feirs.backend.security.payload.ResetPasswordRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final SuperAdminRepository superAdminRepository;
    private final com.feirs.backend.repositories.InstitutionRepository institutionRepository;
    private final com.feirs.backend.repositories.OperatorRepository operatorRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, 
                          JwtUtils jwtUtils, 
                          SuperAdminRepository superAdminRepository,
                          com.feirs.backend.repositories.InstitutionRepository institutionRepository,
                          com.feirs.backend.repositories.OperatorRepository operatorRepository,
                          EmailService emailService,
                          PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.superAdminRepository = superAdminRepository;
        this.institutionRepository = institutionRepository;
        this.operatorRepository = operatorRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getIdentifier(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();    
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        // Validate role selection from frontend matches backend reality
        String requestedRole = loginRequest.getRole();
        if (requestedRole != null) {
            boolean validRole = false;
            if (requestedRole.equals("super-admin") && roles.contains("ROLE_SUPER_ADMIN")) validRole = true;
            if (requestedRole.equals("institution") && roles.contains("ROLE_INSTITUTION")) validRole = true;
            if (requestedRole.equals("operator") && roles.contains("ROLE_OPERATOR")) validRole = true;
            
            if (!validRole) {
                return ResponseEntity.badRequest().body("Selected role does not match user credentials.");
            }
            
            // Block suspended operators
            if (requestedRole.equals("operator") && "SUSPENDED".equalsIgnoreCase(userDetails.getAccountStatus())) {
                return ResponseEntity.status(403).body("Your account is currently suspended. Please contact your Institution Admin for reactivation.");
            }
            
            // Update lastLoginAt based on role
            if (requestedRole.equals("super-admin")) {
                superAdminRepository.findById(userDetails.getId()).ifPresent(sa -> {
                    sa.setLastLoginAt(LocalDateTime.now());
                    superAdminRepository.save(sa);
                });
            } else if (requestedRole.equals("institution")) {
                institutionRepository.findById(userDetails.getId()).ifPresent(inst -> {
                    inst.setLastLoginAt(LocalDateTime.now());
                    institutionRepository.save(inst);
                });
            } else if (requestedRole.equals("operator")) {
                operatorRepository.findById(userDetails.getId()).ifPresent(op -> {
                    op.setLastLoginAt(LocalDateTime.now());
                    operatorRepository.save(op);
                });
            }
        }

        return ResponseEntity.ok(new JwtResponse(jwt, 
                                                 userDetails.getId(), 
                                                 userDetails.getEmail(), 
                                                 roles,
                                                 userDetails.getAccountStatus()));
    }

    @PostMapping("/forgot-password/super-admin")
    public ResponseEntity<?> forgotPasswordSuperAdmin(@RequestBody ForgotPasswordRequest request) {
        String identifier = request.getIdentifier();
        
        // Find by Email or ID
        Optional<SuperAdmin> adminOpt = superAdminRepository.findByMasterEmail(identifier);
        if (adminOpt.isEmpty()) {
            adminOpt = superAdminRepository.findById(identifier);
        }

        if (adminOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("ID/Email does not exist in our system.");
        }

        SuperAdmin admin = adminOpt.get();
        String token = jwtUtils.generatePasswordResetToken(admin.getMasterEmail());
        String resetLink = "http://localhost:5173/reset-password/super-admin?token=" + token + "&id=" + admin.getSuperAdminId();

        try {
            emailService.sendPasswordResetEmail(admin.getMasterEmail(), resetLink);
            return ResponseEntity.ok("An email has been sent with a secure link to reset your password. Please check your inbox.");
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Email sending failed: " + e.getMessage());
            return ResponseEntity.internalServerError().body("Failed to send reset email.");
        }
    }

    @PostMapping("/reset-password/super-admin")
    public ResponseEntity<?> resetPasswordSuperAdmin(@RequestBody ResetPasswordRequest request) {
        String email = jwtUtils.validatePasswordResetTokenAndGetEmail(request.getToken());
        
        if (email == null) {
            return ResponseEntity.badRequest().body("This activation link is invalid, expired, or has already been used.");
        }

        Optional<SuperAdmin> adminOpt = superAdminRepository.findById(request.getId());
        if (adminOpt.isEmpty() || !adminOpt.get().getMasterEmail().equals(email)) {
            return ResponseEntity.badRequest().body("Invalid reset request for this user.");
        }

        SuperAdmin admin = adminOpt.get();
        
        // Check if old password matches new password
        if (passwordEncoder.matches(request.getNewPassword(), admin.getPasswordHash())) {
            return ResponseEntity.badRequest().body("You cannot use your old password, please enter a new one.");
        }

        admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        superAdminRepository.save(admin);

        return ResponseEntity.ok("Your password has been successfully reset. You can now use your new password to securely access your portal.");
    }

    @PostMapping("/activate-account/institution")
    public ResponseEntity<?> activateInstitutionAccount(@RequestBody ResetPasswordRequest request) {
        String email = jwtUtils.validateActivationTokenAndGetEmail(request.getToken());
        
        if (email == null) {
            return ResponseEntity.badRequest().body("This activation link is invalid, expired, or has already been used.");
        }

        Optional<com.feirs.backend.models.Institution> instOpt = institutionRepository.findByOfficialEmail(email);
        if (instOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Institution account not found.");
        }

        com.feirs.backend.models.Institution institution = instOpt.get();
        institution.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        
        if (!"ACTIVE".equals(institution.getAccountStatus())) {
            institution.setAccountStatus("ACTIVE");
        }
        
        institutionRepository.save(institution);

        return ResponseEntity.ok("Account Activated Successfully! Your account is now active and secure. You can now log in to access your portal.");
    }

    @PostMapping("/activate-account/operator")
    public ResponseEntity<?> activateOperatorAccount(@RequestBody ResetPasswordRequest request) {
        String email = jwtUtils.validateActivationTokenAndGetEmail(request.getToken());
        
        if (email == null) {
            return ResponseEntity.badRequest().body("This activation link is invalid, expired, or has already been used.");
        }

        Optional<com.feirs.backend.models.Operator> opOpt = operatorRepository.findByOfficialEmail(email);
        if (opOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Operator account not found.");
        }

        com.feirs.backend.models.Operator operator = opOpt.get();
        operator.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        
        if (!"ACTIVE".equals(operator.getAccountStatus())) {
            operator.setAccountStatus("ACTIVE");
        }
        
        operatorRepository.save(operator);
  
        return ResponseEntity.ok("Account Activated Successfully! Your account is now active and secure. You can now log in to access your portal.");
    }
}
