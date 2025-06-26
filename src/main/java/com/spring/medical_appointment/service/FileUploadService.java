package com.spring.medical_appointment.service;

import org.springframework.web.multipart.MultipartFile;
 
public interface FileUploadService {
    String uploadProfilePicture(MultipartFile file);
    void deleteProfilePicture(String fileName);
} 