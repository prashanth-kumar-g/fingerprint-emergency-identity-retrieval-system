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
@Configuration
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    public static final String ROOT_SUPER_ADMIN_ID = "FEIRS-SA-ROOT";
    public static final String ROOT_MASTER_EMAIL = "feirs.root@feirs.system";
    public static final String ROOT_DEFAULT_PASSWORD = "SuperAdmin@FEIRS2026";

    private final SuperAdminRepository superAdminRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(SuperAdminRepository superAdminRepository,
                      PasswordEncoder passwordEncoder) {
        this.superAdminRepository = superAdminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Order(1)
    public void run(String... args) {
        if (superAdminRepository.existsByMasterEmail(ROOT_MASTER_EMAIL)) {
            log.info("✅ Root Super Admin account already exists — skipping seed.");
            return;
        }

        SuperAdmin root = SuperAdmin.builder()
                .superAdminId(ROOT_SUPER_ADMIN_ID)
                .masterEmail(ROOT_MASTER_EMAIL)
                .passwordHash(passwordEncoder.encode(ROOT_DEFAULT_PASSWORD))
                .adminName(null)        // Nullable by design — architect completes later
                .phoneCountryCode(null)
                .phoneNumber(null)
                .profilePhotoUrl(null)
                .lastLoginAt(null)
                .build();

        superAdminRepository.save(root);
        log.info("🚀 Root Super Admin account seeded successfully!");
        log.info("   ID: {}", ROOT_SUPER_ADMIN_ID);
        log.info("   Email: {}", ROOT_MASTER_EMAIL);
        log.info("   Password: {} (CHANGE IMMEDIATELY AFTER FIRST LOGIN)", ROOT_DEFAULT_PASSWORD);
    }
}
