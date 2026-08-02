package com.pulselink.storage.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileSignatureDetector {

    private static final int SAMPLE_SIZE = 4_096;

    public String detect(MultipartFile file) throws IOException {
        byte[] sample;
        try (InputStream input = file.getInputStream()) {
            sample = input.readNBytes(SAMPLE_SIZE);
        }

        if (startsWith(sample, 0xFF, 0xD8, 0xFF)) return "image/jpeg";
        if (startsWith(sample, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return "image/png";
        }
        if (isWebp(sample)) return "image/webp";
        if (startsWithText(sample, "GIF87a") || startsWithText(sample, "GIF89a")) {
            return "image/gif";
        }
        if (startsWithText(sample, "%PDF-")) return "application/pdf";
        if (startsWith(sample, 0x50, 0x4B, 0x03, 0x04)
                || startsWith(sample, 0x50, 0x4B, 0x05, 0x06)
                || startsWith(sample, 0x50, 0x4B, 0x07, 0x08)) {
            return "application/zip";
        }
        if (looksLikeText(sample)) {
            String declared = declaredType(file);
            return "text/csv".equals(declared) ? "text/csv" : "text/plain";
        }
        return "application/octet-stream";
    }

    private static boolean isWebp(byte[] bytes) {
        return bytes.length >= 12
                && startsWithText(bytes, "RIFF")
                && new String(bytes, 8, 4, StandardCharsets.US_ASCII).equals("WEBP");
    }

    private static boolean looksLikeText(byte[] bytes) {
        if (bytes.length == 0) return false;
        for (byte value : bytes) {
            int unsigned = Byte.toUnsignedInt(value);
            if (unsigned == 0) return false;
            boolean control = unsigned < 0x20
                    && unsigned != '\n'
                    && unsigned != '\r'
                    && unsigned != '\t'
                    && unsigned != '\f';
            if (control) return false;
        }
        return true;
    }

    private static boolean startsWithText(byte[] bytes, String value) {
        byte[] signature = value.getBytes(StandardCharsets.US_ASCII);
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if (bytes[index] != signature[index]) return false;
        }
        return true;
    }

    private static boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) return false;
        for (int index = 0; index < signature.length; index++) {
            if (Byte.toUnsignedInt(bytes[index]) != signature[index]) return false;
        }
        return true;
    }

    private static String declaredType(MultipartFile file) {
        String value = file.getContentType();
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }
}
