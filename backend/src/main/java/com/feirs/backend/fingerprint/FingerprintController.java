// backend/src/main/java/com/feirs/backend/fingerprint/FingerprintController.java
package com.feirs.backend.fingerprint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller — all fingerprint endpoints.
 *
 * NEW endpoints (proxy to MFS100ClientService, fixing CORS):
 *   GET  /api/fingerprint/device-status  — checks MFS100 service + device
 *   POST /api/fingerprint/capture        — captures fingerprint via MFS100
 *
 * EXISTING endpoints:
 *   GET  /api/fingerprint/ping           — test Spring Boot connection
 *   GET  /api/fingerprint/count          — enrolled count
 *   POST /api/fingerprint/enroll         — save fingerprint to DB
 *   POST /api/fingerprint/identify       — 1:N match
 */
@RestController
@RequestMapping("/api/fingerprint")
@CrossOrigin(origins = "*")
public class FingerprintController {

    @Autowired
    private FingerprintService fingerprintService;

    // ── Ping ─────────────────────────────────────────────
    @GetMapping("/ping")
    public ResponseEntity<?> ping() {
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Spring Boot backend is running!",
            "port",    8080
        ));
    }

    // ── Device Status (proxy to MFS100 /info) ─────────────
    // React calls this instead of calling localhost:8004 directly (avoids CORS)
    @GetMapping("/device-status")
    public ResponseEntity<?> deviceStatus() {
        try {
            Map<String, Object> result = fingerprintService.checkDevice();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("serviceReachable", false, "error", e.getMessage()));
        }
    }

    // ── Capture (proxy to MFS100 /capture) ────────────────
    // React calls this instead of calling localhost:8004 directly (avoids CORS)
    // Spring Boot waits up to 15s for the user to place finger
    @PostMapping("/capture")
    public ResponseEntity<?> capture() {
        try {
            Map<String, Object> result = fingerprintService.capture();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("ErrorCode", -1, "Description", e.getMessage()));
        }
    }

    // ── Count enrolled ────────────────────────────────────
    @GetMapping("/count")
    public ResponseEntity<?> count() {
        return ResponseEntity.ok(Map.of("count", fingerprintService.countEnrolled()));
    }

    // ── Enroll ────────────────────────────────────────────
    // Body: { "name": "...", "isoTemplate": "...", "bmpBase64": "..." }
    @PostMapping("/enroll")
    public ResponseEntity<?> enroll(@RequestBody Map<String, String> body) {
        try {
            String name        = body.get("name");
            String isoTemplate = body.get("isoTemplate");
            String bmpBase64   = body.get("bmpBase64");

            if (name == null || name.isBlank())
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Name is required."));
            if (isoTemplate == null || isoTemplate.isBlank())
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "IsoTemplate is required."));

            return ResponseEntity.ok(
                fingerprintService.enroll(name.trim(), isoTemplate, bmpBase64));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // ── Identify ──────────────────────────────────────────
    // Body: { "isoTemplate": "..." }
    @PostMapping("/identify")
    public ResponseEntity<?> identify(@RequestBody Map<String, String> body) {
        try {
            String isoTemplate = body.get("isoTemplate");

            if (isoTemplate == null || isoTemplate.isBlank())
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "IsoTemplate is required."));

            return ResponseEntity.ok(
                fingerprintService.identify(isoTemplate));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
