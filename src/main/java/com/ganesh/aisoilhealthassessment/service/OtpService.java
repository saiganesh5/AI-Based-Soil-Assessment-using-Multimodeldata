package com.ganesh.aisoilhealthassessment.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {
    private final Map<String, String> otpStore = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> otpExpiry = new ConcurrentHashMap<>();
    private final Set<String> verifiedEmails = ConcurrentHashMap.newKeySet();

    public String generateOtp(String email) {
        String otp = String.valueOf(new Random().nextInt(900000) + 100000); // 6-digit
        otpStore.put(email, otp);
        otpExpiry.put(email, LocalDateTime.now().plusMinutes(5)); // expires in 5 min
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        if (!otpStore.containsKey(email)) return false;
        if (LocalDateTime.now().isAfter(otpExpiry.get(email))) {
            otpStore.remove(email);
            otpExpiry.remove(email);
            return false;
        }
        boolean valid = otpStore.get(email).equals(otp);
        if (valid) {
            otpStore.remove(email);  // one time use
            otpExpiry.remove(email);
            verifiedEmails.add(email);
        }
        return valid;
    }

    public boolean isEmailVerified(String email) {
        return verifiedEmails.contains(email);
    }

    public void clearVerification(String email) {
        verifiedEmails.remove(email);
    }
}
