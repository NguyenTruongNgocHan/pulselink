package com.pulselink.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class PasswordEncoderConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        // Cost factor 12: deliberately higher than BCrypt's default (10) to
        // raise brute-force cost, still well under the ~1s/hash pain point.
        return new BCryptPasswordEncoder(12);
    }
}
