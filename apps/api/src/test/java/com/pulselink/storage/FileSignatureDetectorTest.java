package com.pulselink.storage;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.pulselink.storage.service.FileSignatureDetector;

class FileSignatureDetectorTest {

    private final FileSignatureDetector detector = new FileSignatureDetector();

    @Test
    void detectsPngByContentInsteadOfDeclaredHeader() throws Exception {
        byte[] png = new byte[] {
                (byte) 0x89, 0x50, 0x4E, 0x47,
                0x0D, 0x0A, 0x1A, 0x0A,
                0x00, 0x00, 0x00, 0x0D
        };
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.txt",
                "text/plain",
                png
        );

        assertThat(detector.detect(file)).isEqualTo("image/png");
    }

    @Test
    void rejectsUnknownBinaryContent() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "payload.bin",
                "image/png",
                new byte[] {0x00, 0x01, 0x02, 0x03, 0x04}
        );

        assertThat(detector.detect(file)).isEqualTo("application/octet-stream");
    }

    @Test
    void keepsCsvAsTextWhenTheDeclaredTypeIsCsv() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "data.csv",
                "text/csv",
                "name,value\nPulseLink,1\n".getBytes(java.nio.charset.StandardCharsets.UTF_8)
        );

        assertThat(detector.detect(file)).isEqualTo("text/csv");
    }
}
