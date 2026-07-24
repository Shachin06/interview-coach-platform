package com.coach.interview.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${aws.s3.bucket:}")
    private String s3Bucket;

    private final Path localUploadDir = Paths.get("data/uploads").toAbsolutePath().normalize();

    public StorageService() {
        try {
            Files.createDirectories(localUploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create local upload directory", e);
        }
    }

    public String storeFile(MultipartFile file, String subDir) {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();

        // Check if S3 is configured, else fallback to local
        if (s3Bucket != null && !s3Bucket.trim().isEmpty() && !s3Bucket.equals("YOUR_S3_BUCKET")) {
            return uploadToS3(file, fileName, subDir);
        } else {
            return saveLocally(file, fileName, subDir);
        }
    }

    private String saveLocally(MultipartFile file, String fileName, String subDir) {
        try {
            Path targetLocation = this.localUploadDir.resolve(subDir);
            Files.createDirectories(targetLocation);
            
            Path filePath = targetLocation.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return virtual path or absolute path for accessibility
            return "/uploads/" + subDir + "/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Could not store file locally: " + fileName, e);
        }
    }

    private String uploadToS3(MultipartFile file, String fileName, String subDir) {
        // AWS SDK implementation placeholder
        // In local mode, fallback to local storage
        System.out.println("Uploading " + fileName + " to S3 bucket: " + s3Bucket);
        return saveLocally(file, fileName, subDir);
    }
}
