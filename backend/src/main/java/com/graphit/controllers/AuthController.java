package com.graphit.controllers;

import com.graphit.models.Graph;
import com.graphit.models.User;
import com.graphit.repositories.UserRepository;
import com.graphit.services.JwtTokenService;
import com.graphit.utils.ParseUtil;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;



@RestController
@RequestMapping("/api")  // Accessing login, register from frontend
public class AuthController {

    private UserRepository userRepository;
    private JwtTokenService jwtTokenService;
    private PasswordEncoder passwordEncoder;
    private ParseUtil parseUtil;


    AuthController(
        UserRepository userRepository, //something to do with this - could be first
        JwtTokenService jwtTokenService,
        PasswordEncoder passwordEncoder,
        ParseUtil parseUtil
    ) {
        this.userRepository = userRepository;
        this.jwtTokenService = jwtTokenService;
        this.passwordEncoder = passwordEncoder;
        this.parseUtil = parseUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(
        @RequestBody Map<String, String> credentials) {
        if (!credentials.containsKey("email") || !credentials.containsKey("password")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email and password are required."));
        }

        String email = credentials.get("email");
        String password = credentials.get("password");

        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Password incorrect"));
        }

        String jwt = jwtTokenService.generateToken(user);
        return ResponseEntity.ok(Map.of("token", jwt));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> registerUser(@RequestBody Map<String, String> credentials) {
        if (!credentials.containsKey("email") || !credentials.containsKey("password")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email and password are required."));
        }

        String email = credentials.get("email");
        String password = credentials.get("password");

        if (userRepository.findUserByEmail(email) != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Email is already in use."));
        }

        User newUser = new User(
            email,
            passwordEncoder.encode(password),
            new HashMap<String, Graph>() // Assuming an empty graph list
        );
        userRepository.save(newUser);
        String jwt = jwtTokenService.generateToken(newUser);
        return ResponseEntity.ok(Map.of("token", jwt));
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, String>> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
      try {
        String email = parseUtil.getEmailFromAuthHeader(authorizationHeader);
        return ResponseEntity.ok(Map.of("email", email));
      } catch (ResponseStatusException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid Authorization header/token"));
      } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Unexpected error occurred"));
      }
    }
}
