package com.graphit.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/api/login",
                    "/api/register",
                    "/api/graphs",
                    "/api/validate",
                    "/api/health",
                    "/api/login/oauth2/code/google",
                    "/api/ai/create",
                    "/api/ai/query",
                    "/api/algorithm/shortest",
                    "/api/algorithm/bfs",
                    "/api/algorithm/dfs",
                    "/api/algorithm/toposort",
                    "/api/algorithm/mst"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .csrf(csrf -> csrf.disable())
            .httpBasic(Customizer.withDefaults()); // Correct method for basic authentication
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {   //how to use it from here??? hoow to consume in other files ???????
        return new BCryptPasswordEncoder();
    }



}



