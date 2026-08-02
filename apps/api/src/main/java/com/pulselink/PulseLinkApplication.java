package com.pulselink;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.pulselink.auth.security.JwtProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(JwtProperties.class)
public class PulseLinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(
            PulseLinkApplication.class,
            args
        );
    }
}
