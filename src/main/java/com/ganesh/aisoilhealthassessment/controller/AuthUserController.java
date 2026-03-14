package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.AuthResponse;
import com.ganesh.aisoilhealthassessment.model.User;
import com.ganesh.aisoilhealthassessment.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthUserController {

    private final UserRepository userRepository;

    public AuthUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        String displayName = (user.getFirstName() + " " + user.getLastName()).trim();
        return ResponseEntity.ok(new AuthResponse(null, user.getEmail(), displayName));
    }
}
