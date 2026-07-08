package com.feirs.backend.config;

import com.feirs.backend.models.SuperAdmin;
import com.feirs.backend.repositories.SuperAdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Automatic database seeder for the root Super Admin account.
 *
 * Executes on every application startup. Checks if the root account
 * (FEIRS-SA-ROOT) already exists — if not, injects it using only
 * email + password hash, leaving display-name fields null for
 * the architect to complete on first login.
 *
 * Per Super Admin Table Plan.pdf: admin_name is intentionally left null
 * so the architect is prompted to complete their profile after login.
 */
// @Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    // Removed hardcoded root strings


    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(SuperAdminRepository superAdminRepository,
                      PasswordEncoder passwordEncoder) {
        this.superAdminRepository = superAdminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void run(String... args) {
        if (!superAdminRepository.existsByMasterEmail("admin.feirs@gmail.com")) {
            SuperAdmin aditya = SuperAdmin.builder()
                    .superAdminId("FEIRS-SA-GLOBAL")
                    .masterEmail("admin.feirs@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .adminName("Aditya Das")
                    .phoneCountryCode("+91")
                    .phoneNumber("9876543210")
                    .profilePhotoUrl(null)
                    .city(null)
                    .state(null)
                    .country("Global")
                    .build();
            superAdminRepository.save(aditya);
            log.info("🚀 Super Admin 'Aditya Das' (Global) seeded successfully.");
        }

        if (!superAdminRepository.existsByMasterEmail("shetty.admin.feirs@gmail.com")) {
            SuperAdmin divya = SuperAdmin.builder()
                    .superAdminId("FEIRS-SA-BLR")
                    .masterEmail("shetty.admin.feirs@gmail.com")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .adminName("Divya Shetty")
                    .phoneCountryCode("+91")
                    .phoneNumber("9876543211")
                    .profilePhotoUrl(null)
                    .city("Bengaluru")
                    .state("Karnataka")
                    .country("India")
                    .build();
            superAdminRepository.save(divya);
            log.info("🚀 Super Admin 'Divya Shetty' (Bengaluru) seeded successfully.");
        }
    }
}
