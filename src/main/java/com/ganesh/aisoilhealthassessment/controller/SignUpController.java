package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.AuthResponse;
import com.ganesh.aisoilhealthassessment.dto.RegisterRequest;
import com.ganesh.aisoilhealthassessment.model.User;
import com.ganesh.aisoilhealthassessment.repository.UserRepository;
import com.ganesh.aisoilhealthassessment.security.JwtUtil;
import com.ganesh.aisoilhealthassessment.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class SignUpController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (!otpService.isEmailVerified(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Email not verified. Please verify your email first.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Email already registered");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Username already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        userRepository.save(user);
        otpService.clearVerification(user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());
        String displayName = (user.getFirstName() + " " + user.getLastName()).trim();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, user.getEmail(), displayName));
    }
}
