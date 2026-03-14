package com.ganesh.aisoilhealthassessment.controller;


import com.ganesh.aisoilhealthassessment.dto.OtpRequest;
import com.ganesh.aisoilhealthassessment.dto.OtpVerificationRequest;
import com.ganesh.aisoilhealthassessment.service.EmailService;
import com.ganesh.aisoilhealthassessment.service.OtpService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class EmailController {
    private final EmailService emailService;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<String> sendSignUpOTP(@RequestBody OtpRequest otpRequest) {
        if (!emailService.validateEmail(otpRequest.getEmail())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or non-existent email address");
        }
        emailService.sendSignupOtp(otpRequest.getEmail(), otpRequest.getUsername());
        return ResponseEntity.ok("OTP sent to your email");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOTP(@RequestBody OtpVerificationRequest verificationRequest) {
        boolean isValid = otpService.validateOtp(verificationRequest.getEmail(), verificationRequest.getOtp());
        if (isValid) {
            return ResponseEntity.ok("OTP verified successfully");
        } else {
            return ResponseEntity.status(400).body("Invalid or expired OTP");
        }
    }
}
