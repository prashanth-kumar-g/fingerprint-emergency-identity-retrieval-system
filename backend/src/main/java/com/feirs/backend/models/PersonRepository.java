// backend/src/main/java/com/feirs/backend/models/PersonRepository.java
package com.feirs.backend.models;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for Person (enrolled fingerprints).
 * Hibernate auto-creates the "persons" table on first run
 * because application.properties has: spring.jpa.hibernate.ddl-auto=update
 */
@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    // JpaRepository already provides:
    // save(), findById(), findAll(), deleteById(), count(), etc.
    // No extra methods needed for the testing phase.
}