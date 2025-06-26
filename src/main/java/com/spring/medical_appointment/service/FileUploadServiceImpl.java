package com.spring.medical_appointment.service;

import com.spring.medical_appointment.exceptions.InvalidRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileUploadServiceImpl implements FileUploadService {

    @Value("${app.upload.dir:${user.home}/uploads/profile-pictures}")
    private String uploadDir;

    @Override
    public String uploadProfilePicture(MultipartFile file) {
        // Validate file
        if (file.isEmpty()) {
            throw new InvalidRequestException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new InvalidRequestException("Only image files are allowed");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new InvalidRequestException("File size must be less than 5MB");
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Profile picture uploaded successfully: {}", uniqueFilename);
            return uniqueFilename;

        } catch (IOException e) {
            log.error("Failed to upload profile picture", e);
            throw new InvalidRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    @Override
    public void deleteProfilePicture(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return;
        }

        try {
            Path filePath = Paths.get(uploadDir, fileName);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Profile picture deleted: {}", fileName);
            }
        } catch (IOException e) {
            log.error("Failed to delete profile picture: {}", fileName, e);
        }
    }
} 