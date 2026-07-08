package com.feirs.backend.config;

import com.feirs.backend.models.Institution;
import com.feirs.backend.repositories.InstitutionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class FixPasswordsRunner implements CommandLineRunner {
    private final InstitutionRepository institutionRepository;
    private final PasswordEncoder passwordEncoder;

    public FixPasswordsRunner(InstitutionRepository institutionRepository, PasswordEncoder passwordEncoder) {
        this.institutionRepository = institutionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<Institution> institutions = institutionRepository.findAll();
        int count = 0;
        for (Institution inst : institutions) {
            String email = inst.getOfficialEmail();
            String currentHash = inst.getPasswordHash();
            
            // Only generate and save hash if the password is missing or not a bcrypt hash
            if (email != null && email.contains(".") && (currentHash == null || !currentHash.startsWith("$2a$"))) {
                // E.g., krishnarajapura.government.hospital@gmail.com -> Krishnarajapura@123
                String firstPart = email.split("\\.")[0];
                String rawPassword = firstPart.substring(0, 1).toUpperCase() + firstPart.substring(1) + "@123";
                
                System.out.println("Generating new BCrypt hash for: " + email + " with password: " + rawPassword);
                inst.setPasswordHash(passwordEncoder.encode(rawPassword));
                institutionRepository.save(inst);
                count++;
            }
        }
        if (count > 0) {
            System.out.println("Successfully secured " + count + " institution passwords with REAL BCrypt hashes.");
        }
    }
}
