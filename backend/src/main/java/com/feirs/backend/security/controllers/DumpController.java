package com.feirs.backend.security.controllers;

import com.feirs.backend.repositories.InstitutionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class DumpController {

    private final InstitutionRepository institutionRepository;

    public DumpController(InstitutionRepository institutionRepository) {
        this.institutionRepository = institutionRepository;
    }

    @GetMapping("/dump")
    public ResponseEntity<?> dump() {
        return ResponseEntity.ok(institutionRepository.findAll().stream().map(inst -> {
            java.util.Map<String, String> map = new java.util.HashMap<>();
            map.put("email", inst.getOfficialEmail());
            map.put("passwordHash", inst.getPasswordHash());
            return map;
        }).collect(java.util.stream.Collectors.toList()));
    }
}
