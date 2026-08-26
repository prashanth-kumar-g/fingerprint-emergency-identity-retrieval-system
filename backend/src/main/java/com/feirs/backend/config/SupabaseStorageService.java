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
    public String moveFileByUrl(String publicUrl, String bucketName, String newPathPrefix) throws Exception {
        if (publicUrl == null || !publicUrl.contains(supabaseUrl)) {
            return publicUrl;
        }

        String basePath = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/";
        if (!publicUrl.startsWith(basePath)) return publicUrl;
        
        String oldFilePath = publicUrl.substring(basePath.length());
        
        String fileName = oldFilePath;
        if (oldFilePath.contains("/")) {
            fileName = oldFilePath.substring(oldFilePath.lastIndexOf("/") + 1);
        }

        String newFilePath = newPathPrefix + "/" + fileName;

        String endpoint = supabaseUrl + "/storage/v1/object/move";
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(supabaseKey);
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        String requestBody = "{\"bucketId\": \"" + bucketName + "\", \"sourceKey\": \"" + oldFilePath + "\", \"destinationKey\": \"" + newFilePath + "\"}";

        org.springframework.http.HttpEntity<String> requestEntity = new org.springframework.http.HttpEntity<>(requestBody, headers);
        org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(endpoint, org.springframework.http.HttpMethod.POST, requestEntity, String.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            return basePath + newFilePath;
        } else {
            throw new Exception("Failed to move file in Supabase. Status: " + response.getStatusCode());
        }
    }

    public void deleteFileByUrl(String publicUrl, String bucketName) {
        if (publicUrl == null || !publicUrl.contains(supabaseUrl)) {
            return;
        }

        try {
            String basePath = supabaseUrl + "/storage/v1/object/public/" + bucketName + "/";
            if (!publicUrl.startsWith(basePath)) return;
            
            String filePath = publicUrl.substring(basePath.length());
            String endpoint = supabaseUrl + "/storage/v1/object/" + bucketName;

            String requestBody = "{\"prefixes\": [\"" + filePath + "\"]}";

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(endpoint))
                    .header("Authorization", "Bearer " + supabaseKey)
                    .header("Content-Type", "application/json")
                    .method("DELETE", java.net.http.HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            java.net.http.HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                    .send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Successfully deleted old file from storage: {}", filePath);
            } else {
                log.error("Failed to delete file from Supabase: {} - {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to delete file from Supabase: {}", e.getMessage());
        }
    
    }
}