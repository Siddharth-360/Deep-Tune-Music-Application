package com.music.MusicPlayer.Controller;

import com.music.MusicPlayer.Models.Listener;
import com.music.MusicPlayer.Service.ListenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/api/listener")
public class ListenerApiController {

    private static final Logger logger = Logger.getLogger(ListenerApiController.class.getName());

    @Autowired
    private ListenerService listenerService;

    @GetMapping("/{email}")
    public ResponseEntity<?> getListener(@PathVariable String email) {
        try {
            // Validate email parameter
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email parameter is required"));
            }

            logger.info("Fetching listener with email: " + email);
            Listener listener = listenerService.getUser(email.trim());

            if (listener != null) {
                // Create a response DTO to avoid sending sensitive data
                Map<String, Object> response = new HashMap<>();
                response.put("id", listener.getId());
                response.put("name", listener.getName());
                response.put("email", listener.getEmail());
                response.put("profilePhoto", listener.getProfilePhoto());
                response.put("isPremium", listener.isPremium());
                response.put("status", "success");

                logger.info("Successfully retrieved listener: " + email);
                return ResponseEntity.ok(response);
            } else {
                logger.warning("Listener not found with email: " + email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("User not found"));
            }
        } catch (Exception e) {
            logger.severe("Error retrieving user data for email: " + email + " - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }

    @PutMapping("/update/{email}")
    public ResponseEntity<?> updateListener(@PathVariable String email, @RequestBody Map<String, Object> updates) {
        try {
            System.out.println("=== UPDATE REQUEST ===");
            System.out.println("Email: " + email);
            System.out.println("Updates: " + updates);

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email parameter is required"));
            }

            if (updates == null || updates.isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("No update data provided"));
            }

            String name = (String) updates.get("name");
            String profilePhoto = (String) updates.get("profilePhoto");

            System.out.println("Extracted name: " + name);
            System.out.println("Extracted profilePhoto: " + profilePhoto);

            // Use the dedicated update method
            Listener updatedListener = listenerService.updateListener(email.trim(), name, profilePhoto);

            if (updatedListener != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Profile updated successfully");
                response.put("status", "success");
                response.put("updatedName", updatedListener.getName());

                System.out.println("=== UPDATE SUCCESS ===");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(createErrorResponse("Failed to update profile"));
            }

        } catch (Exception e) {
            System.out.println("=== UPDATE ERROR ===");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Error: " + e.getMessage()));
        }
    }
    // Additional endpoint to check if user exists
    @GetMapping("/{email}/exists")
    public ResponseEntity<?> checkUserExists(@PathVariable String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email parameter is required"));
            }

            Listener listener = listenerService.getUser(email.trim());
            Map<String, Object> response = new HashMap<>();
            response.put("exists", listener != null);
            response.put("email", email);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.severe("Error checking user existence: " + email + " - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }
    private final String UPLOAD_DIR = "src/main/resources/static/pictures/";

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @RequestParam("email") String email) {

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), filePath);

            // Return the file path (accessible via URL)
            String relativeFilePath = "/pictures/" + uniqueFileName;

            Map<String, String> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("fileName", uniqueFileName);
            response.put("filePath", relativeFilePath);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to upload file: " + e.getMessage());
        }
    }

    // Helper method to create consistent error responses
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("status", "error");
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        return errorResponse;
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Listener API");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}