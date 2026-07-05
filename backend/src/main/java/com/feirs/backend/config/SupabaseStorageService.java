package com.feirs.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate;

    public SupabaseStorageService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Uploads a file to Supabase Storage and returns the public URL.
     */
    public String uploadFile(MultipartFile file, String bucketName, String pathPrefix) throws Exception {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        // Generate a unique filename to prevent overwrites
        String uniqueFileName = pathPrefix + "/" + UUID.randomUUID().toString() + extension;
        String endpoint = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + uniqueFileName;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(supabaseKey);
        headers.setContentType(MediaType.valueOf(file.getContentType() != null ? file.getContentType() : "application/octet-stream"));

        HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);

        ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, requestEntity, String.class);

        if (response.getStatusCode() == HttpStatus.OK || response.getStatusCode() == HttpStatus.CREATED) {
            return supabaseUrl + "/storage/v1/object/public/" + bucketName + "/" + uniqueFileName;
        } else {
            throw new Exception("Failed to upload file to Supabase. Status: " + response.getStatusCode());
        }
    }

    /**
     * Deletes a file from Supabase Storage given its public URL.
     */
    public void deleteFileByUrl(String publicUrl, String bucketName) {
        if (publicUrl == null || !publicUrl.contains(supabaseUrl)) {
            return; // Not a supabase URL or null
        }

        try {
            // Extract the path from the URL: https://[URL]/storage/v1/object/public/[BUCKET]/[PATH]
            String basePath = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/";
            if (!publicUrl.startsWith(basePath)) return;
            
            String filePath = publicUrl.substring(basePath.length());
            String endpoint = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(supabaseKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            restTemplate.exchange(endpoint, HttpMethod.DELETE, requestEntity, String.class);
            log.info("Successfully deleted old file from storage: {}", filePath);
        } catch (Exception e) {
            log.error("Failed to delete file from Supabase: {}", e.getMessage());
        }
    }
}
