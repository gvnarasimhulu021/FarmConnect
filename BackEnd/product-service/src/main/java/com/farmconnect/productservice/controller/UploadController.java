package com.farmconnect.productservice.controller;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp", "gif", "bmp");

    private final Path uploadDirectory;

    public UploadController(@Value("${farmconnect.upload-dir:uploads}") String uploadDir) {
        this.uploadDirectory = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void initializeUploadDirectory() {
        try {
            Files.createDirectories(uploadDirectory);
        } catch (IOException ex) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Unable to initialize upload directory", ex);
        }
    }

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadImage(@RequestParam("image") MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(BAD_REQUEST, "Image file is required");
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(BAD_REQUEST, "Only image files are allowed");
        }

        String extension = resolveExtension(image.getOriginalFilename());
        String fileName = UUID.randomUUID() + "." + extension;
        Path targetFile = uploadDirectory.resolve(fileName).normalize();

        if (!targetFile.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid file path");
        }

        try (InputStream inputStream = image.getInputStream()) {
            Files.copy(inputStream, targetFile, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Failed to store image", ex);
        }

        return Map.of("url", "/api/upload/files/" + fileName);
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable("fileName") String fileName) {
        Path targetFile = uploadDirectory.resolve(fileName).normalize();
        if (!targetFile.startsWith(uploadDirectory)) {
            throw new ResponseStatusException(BAD_REQUEST, "Invalid file path");
        }
        if (!Files.exists(targetFile) || !Files.isRegularFile(targetFile)) {
            throw new ResponseStatusException(NOT_FOUND, "Image not found");
        }

        Resource resource;
        try {
            resource = new UrlResource(targetFile.toUri());
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Unable to read image file", ex);
        }

        String contentType = "application/octet-stream";
        try {
            String detected = Files.probeContentType(targetFile);
            if (detected != null && !detected.isBlank()) {
                contentType = detected;
            }
        } catch (IOException ignored) {
            // default content type is used
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .cacheControl(CacheControl.noCache())
                .body(resource);
    }

    private String resolveExtension(String fileName) {
        String extension = StringUtils.getFilenameExtension(fileName);
        if (extension == null) {
            throw new ResponseStatusException(BAD_REQUEST, "File extension is required");
        }

        String normalized = extension.trim().toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(normalized)) {
            throw new ResponseStatusException(BAD_REQUEST, "Unsupported image format");
        }
        return normalized;
    }
}
