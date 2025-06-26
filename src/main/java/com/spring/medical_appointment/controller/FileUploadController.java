package com.spring.medical_appointment.controller;

import com.spring.medical_appointment.models.UserEntity;
import com.spring.medical_appointment.service.FileUploadService;
import com.spring.medical_appointment.service.user.UserRoleMapperFactory;
import com.spring.medical_appointment.service.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final FileUploadService fileUploadService;
    private final UserService userService;
    private final UserRoleMapperFactory userRoleMapperFactory;

    @Value("${app.upload.dir:${user.home}/uploads/profile-pictures}")
    private String uploadDir;

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestPart("file") MultipartFile file) {
        try {
            log.info("Uploading profile picture: {}", file.getOriginalFilename());
            
            // Get current user to check if they have an existing profile picture
            UserEntity currentUser = userService.getCurrentUser();
            String oldProfilePictureUrl = currentUser.getProfilePictureUrl();
            
            // Upload the new file
            String fileName = fileUploadService.uploadProfilePicture(file);
            
            // Create the full URL for the uploaded image
            String imageUrl = "http://localhost:8080/api/files/profile-pictures/" + fileName;
            
            // Update the user's profile picture URL
            UserEntity updatedUser = userService.updateProfilePicture(imageUrl);
            
            // Delete the old profile picture if it exists
            if (oldProfilePictureUrl != null && !oldProfilePictureUrl.isEmpty()) {
                String oldFileName = extractFileNameFromUrl(oldProfilePictureUrl);
                if (oldFileName != null) {
                    fileUploadService.deleteProfilePicture(oldFileName);
                    log.info("Deleted old profile picture: {}", oldFileName);
                }
            }
            
            Object dto = userRoleMapperFactory.getMapper(currentUser.getRole(), updatedUser);
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Error uploading profile picture", e);
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/profile-pictures/{fileName:.+}")
    public ResponseEntity<Resource> serveProfilePicture(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determine content type based on file extension
                String contentType = "image/jpeg"; // default
                if (fileName.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (fileName.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (fileName.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000") // Cache for 1 year
                        .body(resource);
            } else {
                log.warn("Profile picture not found: {}", fileName);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            log.error("Error serving profile picture: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }
    
    private String extractFileNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }
        String[] parts = url.split("/");
        return parts[parts.length - 1];
    }
} 