package com.groundgear.controller;

import com.groundgear.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String token = authService.register(
                    username,
                    request.get("email"),
                    request.get("password")
            );
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", authService.getRoleForUsername(username)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String token = authService.login(username, request.get("password"));
            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "role", authService.getRoleForUsername(username)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }
}