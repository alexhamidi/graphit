package com.graphit.utils;

import com.graphit.services.JwtTokenService;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class ParseUtil {

    private JwtTokenService jwtTokenService;

    public ParseUtil(JwtTokenService jwtTokenService) {
        this.jwtTokenService = jwtTokenService;
    }

    public String getEmailFromAuthHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Authorization header or token");
        }
        String token = authorizationHeader.substring(7);
        try {
            String email = jwtTokenService.extractEmailFromToken(token);
            if (email == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Authorization header or token");
            }
            return email;
        } catch (JwtException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Authorization header or token", e);
        }
    }
}
