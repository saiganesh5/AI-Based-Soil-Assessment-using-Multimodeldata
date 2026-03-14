package com.ganesh.aisoilhealthassessment.controller;

import com.ganesh.aisoilhealthassessment.dto.OtpRequest;
import com.ganesh.aisoilhealthassessment.dto.ResetPasswordRequest;
import com.ganesh.aisoilhealthassessment.model.User;
import com.ganesh.aisoilhealthassessment.repository.UserRepository;
import com.ganesh.aisoilhealthassessment.service.EmailService;
import com.ganesh.aisoilhealthassessment.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;

    /**
     * POST /auth/forgot-password
     * Accepts { "email": "..." }, validates the email exists in the DB,
     * then sends an OTP to that email for password reset.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody OtpRequest request) {
        String email = request.getEmail();

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No account found with this email address");
        }

        User user = userOpt.get();
        String username = user.getUsername();

        emailService.sendForgotPasswordOtp(email.trim().toLowerCase(), username);

        return ResponseEntity.ok("OTP sent to your email");
    }

    /**
     * POST /auth/reset-password
     * Accepts { "email": "...", "newPassword": "..." }.
     * Requires that the email was verified via OTP beforehand.
     * Updates the user's password and clears the verification.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = request.getEmail();
        String newPassword = request.getNewPassword();

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Password must be at least 6 characters");
        }

        if (!otpService.isEmailVerified(email.trim().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Email not verified. Please verify your email first.");
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("No account found with this email address");
        }

        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        otpService.clearVerification(email.trim().toLowerCase());

        return ResponseEntity.ok("Password has been reset successfully");
    }
}
