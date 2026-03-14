package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.AuthRequest;
import com.ganesh.aisoilhealthassessment.dto.AuthResponse;
import com.ganesh.aisoilhealthassessment.model.User;
import com.ganesh.aisoilhealthassessment.repository.UserRepository;
import com.ganesh.aisoilhealthassessment.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class LoginController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginController(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @CrossOrigin("*")
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        String displayName = (user.getFirstName() + " " + user.getLastName()).trim();

        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), displayName));
    }
}
