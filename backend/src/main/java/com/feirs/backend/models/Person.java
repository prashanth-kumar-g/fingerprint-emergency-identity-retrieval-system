// backend/src/main/java/com/feirs/backend/models/Person.java
package com.feirs.backend.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores one enrolled fingerprint per person.
 * isoTemplate — base64 ISO FMR template from MFS100ClientService.
 * bmpBase64   — base64 BMP image (optional, for display).
 */
@Entity
@Table(name = "persons")
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // ISO FMR template returned by MFS100ClientService /capture
    @Column(columnDefinition = "TEXT", nullable = false)
    private String isoTemplate;

    // BMP image (base64) — stored for display purposes
    @Column(columnDefinition = "TEXT")
    private String bmpBase64;

    @Column(nullable = false)
    private LocalDateTime enrolledAt;

    // ── Constructors ──────────────────────────────────────
    public Person() {}

    public Person(String name, String isoTemplate, String bmpBase64) {
        this.name        = name;
        this.isoTemplate = isoTemplate;
        this.bmpBase64   = bmpBase64;
        this.enrolledAt  = LocalDateTime.now();
    }

    // ── Getters / Setters ─────────────────────────────────
    public Long          getId()          { return id; }
    public void          setId(Long id)   { this.id = id; }

    public String        getName()              { return name; }
    public void          setName(String name)   { this.name = name; }

    public String        getIsoTemplate()                    { return isoTemplate; }
    public void          setIsoTemplate(String isoTemplate)  { this.isoTemplate = isoTemplate; }

    public String        getBmpBase64()                 { return bmpBase64; }
    public void          setBmpBase64(String bmpBase64) { this.bmpBase64 = bmpBase64; }

    public LocalDateTime getEnrolledAt()                      { return enrolledAt; }
    public void          setEnrolledAt(LocalDateTime t)        { this.enrolledAt = t; }
}
