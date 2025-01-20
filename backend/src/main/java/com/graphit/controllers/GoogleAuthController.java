package com.graphit.controllers;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.graphit.models.Graph;
import com.graphit.models.User;
import com.graphit.repositories.UserRepository;
import com.graphit.services.JwtTokenService;
import java.net.URI;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
public class GoogleAuthController {

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${backend.url}")
    private String backendUrl;

    private UserRepository userRepository;
    private RestTemplate restTemplate;
    private JwtTokenService jwtTokenService;

    GoogleAuthController(
        UserRepository userRepository,
        RestTemplate restTemplate, // two not working - no bean
        JwtTokenService jwtTokenService
    ) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
        this.jwtTokenService = jwtTokenService;
    }

    // google stuff goes here
    @GetMapping("/login/oauth2/code/google")
    public ResponseEntity<Void> processAuth(@RequestParam("code") String code) {
    try {
        // Step 1: Exchange the authorization code for an access token
        LinkedMultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("redirect_uri", backendUrl + "/api/login/oauth2/code/google");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("grant_type", "authorization_code");
        HttpHeaders httpHeaders = new HttpHeaders();

        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<LinkedMultiValueMap<String, String>> tokenRequest = new HttpEntity<>(params, httpHeaders);
        String tokenResponse = restTemplate.postForObject("https://oauth2.googleapis.com/token", tokenRequest, String.class);
        JsonObject tokenJson = new Gson().fromJson(tokenResponse, JsonObject.class);
        String accessToken = tokenJson.get("access_token").getAsString();

        // Step 2: Use the access token to fetch user info from Google
        httpHeaders.setBearerAuth(accessToken);
        HttpEntity<String> userInfoRequest = new HttpEntity<>(httpHeaders);
        ResponseEntity<String> responseEntity = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            HttpMethod.GET,
            userInfoRequest,
            String.class
        );

        JsonObject userInfo = new Gson().fromJson(responseEntity.getBody(), JsonObject.class);
        String email = userInfo.get("email").getAsString();

        // Step 3: Create the user if they don't exist
        User user = userRepository.findUserByEmail(email);
        if (user == null) {
            String googleId = userInfo.get("id").getAsString();
            user = new User(email, googleId, new HashMap<String, Graph>());
            userRepository.save(user);
        }

        // Step 4: Generate a JWT token for the authenticated user
        String jwt = jwtTokenService.generateToken(user);

        // Step 5: Redirect back to the frontend with the token
        String redirectUrl = (frontendUrl + "/login?token=" + jwt);
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(redirectUrl)).build();

    } catch (Exception e) {
        System.out.println(e);
        // Step 6: Handle any errors by redirecting to an error page
        String errorUrl = (frontendUrl + "/login?error=login%20error");
        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(errorUrl)).build();
    }
}

}
