package com.feirs.backend.fingerprint;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.feirs.backend.models.Person;
import com.feirs.backend.models.PersonRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.*;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class FingerprintService {

    private static final Logger log = LoggerFactory.getLogger(FingerprintService.class);
    private static final String MFS100_URL = "http://localhost:8004/mfs100";

    @Value("${fingerprint.save.path}")
    private String savePath;

    @Autowired
    private PersonRepository personRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        log.info("FingerprintService started.");
        log.info("Using MFS100ClientService at: {}", MFS100_URL);
        log.info("BMP save path: {}", savePath);
    }

    // ── CHECK DEVICE ──────────────────────────────────────
    public Map<String, Object> checkDevice() {
        try {
            HttpURLConnection conn = (HttpURLConnection)
                new URL(MFS100_URL + "/info").openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(3000);

            int code = conn.getResponseCode();
            InputStream is = (code == 200) ? conn.getInputStream() : conn.getErrorStream();
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = r.readLine()) != null) sb.append(line);
            }
            conn.disconnect();

            Map<String, Object> result = new HashMap<>(mapper.readValue(sb.toString(), Map.class));
            result.put("serviceReachable", true);
            log.info("MFS100 /info  ErrorCode={}", result.get("ErrorCode"));
            return result;

        } catch (Exception e) {
            log.warn("MFS100ClientService not reachable: {}", e.getMessage());
            Map<String, Object> r = new HashMap<>();
            r.put("serviceReachable", false);
            r.put("ErrorCode",        -1);
            r.put("Description",      "MFS100ClientService is not running.");
            return r;
        }
    }

    // ── CAPTURE ───────────────────────────────────────────
    public Map<String, Object> capture() throws Exception {
        log.info("Proxying capture request to MFS100ClientService...");

        HttpURLConnection conn = (HttpURLConnection)
            new URL(MFS100_URL + "/capture").openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(15000);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("Quality", 60);
        requestBody.put("TimeOut", 10000);

        byte[] jsonBytes = mapper.writeValueAsBytes(requestBody);
        conn.getOutputStream().write(jsonBytes);
        conn.getOutputStream().flush();

        int responseCode = conn.getResponseCode();
        InputStream is = (responseCode == 200) ? conn.getInputStream() : conn.getErrorStream();
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }
        conn.disconnect();

        Map<String, Object> result = mapper.readValue(sb.toString(), Map.class);
        log.info("Capture result: ErrorCode={}, Quality={}", result.get("ErrorCode"), result.get("Quality"));
        return result;
    }

    // ── ENROLL ────────────────────────────────────────────
    public Map<String, Object> enroll(String name,
                                       String isoTemplate,
                                       String bmpBase64) throws Exception {
        Person person = new Person(name, isoTemplate, bmpBase64);
        person = personRepository.save(person);

        if (bmpBase64 != null && !bmpBase64.isBlank()) {
            try { saveBmpFile(bmpBase64, name + "_" + person.getId()); }
            catch (Exception e) { log.warn("BMP file save skipped: {}", e.getMessage()); }
        }

        log.info("Enrolled: '{}' (ID={})", name, person.getId());

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("id",      person.getId());
        result.put("name",    person.getName());
        result.put("message", "Fingerprint enrolled successfully!");
        return result;
    }

    // ── IDENTIFY ──────────────────────────────────────────
    public Map<String, Object> identify(String probeTemplate) throws Exception {
        List<Person> all = personRepository.findAll();

        if (all.isEmpty()) {
            return Map.of("found", false,
                "message", "No fingerprints enrolled yet. Use Enroll tab first.");
        }

        log.info("Identifying probe against {} enrolled fingerprints...", all.size());

        for (Person person : all) {
            if (person.getIsoTemplate() == null || person.getIsoTemplate().isBlank()) continue;

            boolean matched = callMFS100Verify(probeTemplate, person.getIsoTemplate());
            if (matched) {
                log.info("Match found: '{}' (ID={})", person.getName(), person.getId());

                String enrolledAt = person.getEnrolledAt() != null
                    ? person.getEnrolledAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm"))
                    : "Unknown";

                Map<String, Object> r = new HashMap<>();
                r.put("found",      true);
                r.put("id",         person.getId());
                r.put("name",       person.getName());
                r.put("enrolledAt", enrolledAt);
                r.put("bmpBase64",  person.getBmpBase64());
                return r;
            }
        }

        log.info("No match found among {} enrolled fingerprints.", all.size());
        return Map.of("found", false, "message", "No matching fingerprint found in the database.");
    }

    // ══════════════════════════════════════════════════════
    //  VERIFY — THE FIXED METHOD
    //  ─────────────────────────────────────────────────────
    //  ROOT CAUSE OF PREVIOUS FAILURE:
    //    MFS100ClientService /verify returns ErrorCode as a
    //    STRING "0", not integer 0.
    //    Old code:  (int) resp.getOrDefault("ErrorCode", -1)
    //    This cast String→int throws ClassCastException.
    //    Catch block silently returned false → no match ever.
    //
    //    Similarly Status can come back as string "True"/"False"
    //    so Boolean.TRUE.equals("True") = false → same silent fail.
    //
    //  FIX: parse both fields as strings, never cast directly.
    // ══════════════════════════════════════════════════════
    private boolean callMFS100Verify(String probeTemplate, String galleryTemplate) {
        try {
            HttpURLConnection conn = (HttpURLConnection)
                new URL(MFS100_URL + "/verify").openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(3000);
            conn.setReadTimeout(5000);

            Map<String, String> body = new LinkedHashMap<>();
            body.put("ProbTemplate",    probeTemplate);
            body.put("GalleryTemplate", galleryTemplate);
            body.put("BioType",         "FMR");

            conn.getOutputStream().write(mapper.writeValueAsBytes(body));

            int code = conn.getResponseCode();
            InputStream is = (code == 200) ? conn.getInputStream() : conn.getErrorStream();
            StringBuilder sb = new StringBuilder();
            try (BufferedReader r = new BufferedReader(new InputStreamReader(is))) {
                String line;
                while ((line = r.readLine()) != null) sb.append(line);
            }
            conn.disconnect();

            Map<String, Object> resp = mapper.readValue(sb.toString(), Map.class);

            // ── FIX 1: parse ErrorCode safely — handles String "0" or Integer 0 ──
            int errorCode;
            Object errObj = resp.getOrDefault("ErrorCode", "-1");
            try {
                errorCode = Integer.parseInt(errObj.toString().trim());
            } catch (NumberFormatException e) {
                errorCode = -1;
            }

            // ── FIX 2: parse Status safely — handles String "True"/"False" or Boolean ──
            Object statusObj = resp.get("Status");
            boolean matched;
            if (statusObj instanceof Boolean) {
                matched = (Boolean) statusObj;
            } else {
                matched = "true".equalsIgnoreCase(String.valueOf(statusObj));
            }

            // ── Log score for debugging ───────────────────────────────────────────
            Object score = resp.get("Score");
            log.info("Verify → ErrorCode={} Status={} Score={}", errorCode, matched, score);

            return errorCode == 0 && matched;

        } catch (Exception e) {
            log.error("MFS100 verify error: {}", e.getMessage());
            return false;
        }
    }

    // ── COUNT ─────────────────────────────────────────────
    public long countEnrolled() {
        return personRepository.count();
    }

    // ── SAVE BMP FILE ─────────────────────────────────────
    private void saveBmpFile(String bmpBase64, String label) throws Exception {
        byte[] bytes = Base64.getDecoder().decode(bmpBase64);
        Path dir = Paths.get(savePath);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String ts   = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String path = savePath + "fp_" + label + "_" + ts + ".bmp";
        Files.write(Paths.get(path), bytes);
        log.info("BMP saved: {}", path);
    }
}
