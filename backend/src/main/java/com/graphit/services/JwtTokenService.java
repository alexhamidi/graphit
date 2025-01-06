package com.graphit.services;

import com.graphit.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;



@Service
public class JwtTokenService {

    @Value("${jwt.secret-key}")
    private String secretKeyString;


    public String generateToken(User user) {
        SecretKey secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        return Jwts.builder()
                .setSubject(user.getEmail())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(secretKey)
                .compact();
    }


    public String extractEmailFromToken(String token) {
        SecretKey secretKey = Keys.hmacShaKeyFor(secretKeyString.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

}
