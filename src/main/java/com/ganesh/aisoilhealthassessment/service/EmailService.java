package com.ganesh.aisoilhealthassessment.service;

import com.ganesh.aisoilhealthassessment.dto.SendBridgeResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender javaMailSender;
    private final OtpService otpService;
    private final RestTemplate restTemplate;

    @Value("${sendbridge.api.token}")
    private String sendBridgeApiToken;


    public void sendMail(String to, String subject, String body){
        try{
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(body);
            javaMailSender.send(mail);
        } catch (Exception e) {
            log.error("Exception while sendEmail ", e);
        }
    }

    public void sendSignupOtp(String toEmail, String userName) {
        String otp = otpService.generateOtp(toEmail);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Verify Your Email – SoilHealth AI Account Activation");
            helper.setText(buildOtpEmailBody(userName, otp), true); // 'true' means HTML

            javaMailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email", e);
        }
    }

    private String buildOtpEmailBody(String userName, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
                
                    <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
                        <tr>
                            <td align="center">
                                <table width="600" cellpadding="0" cellspacing="0"
                                       style="background-color:#ffffff; border-radius:8px;
                                              box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow:hidden;">
                
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color:#2e7d32; padding: 32px 40px; text-align:center;">
                                            <h1 style="margin:0; color:#ffffff; font-size:24px; letter-spacing:1px;">
                                                🌱 SoilHealth AI
                                            </h1>
                                            <p style="margin:6px 0 0; color:#a5d6a7; font-size:13px;">
                                                Intelligent Soil Assessment Platform
                                            </p>
                                        </td>
                                    </tr>
                
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px 40px 20px;">
                                            <p style="margin:0 0 16px; font-size:16px; color:#333333;">
                                                Hi <strong>%s</strong>,
                                            </p>
                                            <p style="margin:0 0 16px; font-size:15px; color:#555555; line-height:1.6;">
                                                Thank you for signing up with <strong>SoilHealth AI</strong>.
                                                To complete your registration, please verify your email address
                                                using the One-Time Password (OTP) below.
                                            </p>
                
                                            <!-- OTP Box -->
                                            <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <div style="display:inline-block; background-color:#f1f8e9;
                                                                    border: 2px dashed #2e7d32; border-radius:8px;
                                                                    padding: 20px 48px;">
                                                            <p style="margin:0 0 6px; font-size:12px;
                                                                       color:#777; letter-spacing:2px;
                                                                       text-transform:uppercase;">
                                                                Your OTP Code
                                                            </p>
                                                            <p style="margin:0; font-size:36px; font-weight:bold;
                                                                       color:#2e7d32; letter-spacing:10px;">
                                                                %s
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                
                                            <p style="margin:0 0 12px; font-size:14px; color:#555555; line-height:1.6;">
                                                ⏱️ This OTP is valid for <strong>5 minutes</strong> only.
                                            </p>
                                            <p style="margin:0 0 24px; font-size:14px; color:#555555; line-height:1.6;">
                                                If you did not create an account with SoilHealth AI,
                                                please ignore this email or contact our support team immediately.
                                            </p>
                
                                            <hr style="border:none; border-top:1px solid #eeeeee; margin: 24px 0;"/>
                
                                            <p style="margin:0; font-size:12px; color:#999999; line-height:1.6;">
                                                🔒 For your security, never share this OTP with anyone.
                                                SoilHealth AI will never ask for your OTP via phone or chat.
                                            </p>
                                        </td>
                                    </tr>
                
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color:#f9f9f9; padding: 24px 40px; text-align:center;
                                                   border-top: 1px solid #eeeeee;">
                                            <p style="margin:0 0 6px; font-size:12px; color:#aaaaaa;">
                                                © 2026 SoilHealth AI. All rights reserved.
                                            </p>
                                            <p style="margin:0; font-size:12px; color:#aaaaaa;">
                                                Need help? Contact us at
                                                <a href="mailto:soilhealthproject.help@gmail.com"
                                                   style="color:#2e7d32; text-decoration:none;">
                                                    soilhealthproject.help@gmail.com
                                                </a>
                                            </p>
                                        </td>
                                    </tr>
                
                                </table>
                            </td>
                        </tr>
                    </table>
                
                </body>
                </html>
                """.formatted(userName, otp);
    }

    public void sendForgotPasswordOtp(String toEmail, String userName) {
        String otp = otpService.generateOtp(toEmail);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Password Reset – SoilHealth AI");
            helper.setText(buildForgotPasswordEmailBody(userName, otp), true);

            javaMailSender.send(message);
        } catch (MessagingException e) {
            log.error("Failed to send forgot-password OTP email", e);
        }
    }

    private String buildForgotPasswordEmailBody(String userName, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                </head>
                <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">
                
                <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding: 40px 0;">
                    <tr>
                        <td align="center">
                            <table width="600" cellpadding="0" cellspacing="0"
                                   style="background-color:#ffffff; border-radius:8px;
                                              box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow:hidden;">
                
                                <!-- Header -->
                                <tr>
                                    <td style="background-color:#2e7d32; padding: 32px 40px; text-align:center;">
                                        <h1 style="margin:0; color:#ffffff; font-size:24px; letter-spacing:1px;">
                                            🌱 SoilHealth AI
                                        </h1>
                                        <p style="margin:6px 0 0; color:#a5d6a7; font-size:13px;">
                                            Intelligent Soil Assessment Platform
                                        </p>
                                    </td>
                                </tr>
                
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 40px 40px 20px;">
                                        <p style="margin:0 0 16px; font-size:16px; color:#333333;">
                                            Hi <strong>%s</strong>,
                                        </p>
                                        <p style="margin:0 0 16px; font-size:15px; color:#555555; line-height:1.6;">
                                            We received a request to reset the password for your
                                            <strong>SoilHealth AI</strong> account. Use the One-Time
                                            Password (OTP) below to proceed with resetting your password.
                                        </p>
                
                                        <!-- OTP Box -->
                                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                                            <tr>
                                                <td align="center">
                                                    <div style="display:inline-block; background-color:#e3f2fd;
                                                                    border: 2px dashed #2e7d32; border-radius:8px;
                                                                    padding: 20px 48px;">
                                                        <p style="margin:0 0 6px; font-size:12px;
                                                                       color:#777; letter-spacing:2px;
                                                                       text-transform:uppercase;">
                                                            Password Reset OTP
                                                        </p>
                                                        <p style="margin:0; font-size:36px; font-weight:bold;
                                                                       color:#2e7d32; letter-spacing:10px;">
                                                            %s
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                
                                        <p style="margin:0 0 12px; font-size:14px; color:#555555; line-height:1.6;">
                                            ⏱️ This OTP is valid for <strong>5 minutes</strong> only.
                                        </p>
                
                                        <!-- Warning Box -->
                                        <table width="100%%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                                            <tr>
                                                <td style="background-color:#fff8e1; border-left: 4px solid #f9a825;
                                                               border-radius:4px; padding: 14px 18px;">
                                                    <p style="margin:0; font-size:13px; color:#7c5e00; line-height:1.6;">
                                                        ⚠️ <strong>Did not request a password reset?</strong><br/>
                                                        If you did not make this request, please ignore this email.
                                                        Your account remains secure. However, we recommend changing
                                                        your password immediately if you suspect unauthorized access.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                
                                        <hr style="border:none; border-top:1px solid #eeeeee; margin: 24px 0;"/>
                
                                        <p style="margin:0; font-size:12px; color:#999999; line-height:1.6;">
                                            🔒 For your security, never share this OTP with anyone.
                                            SoilHealth AI will never ask for your OTP via phone or chat.
                                        </p>
                                    </td>
                                </tr>
                
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color:#f9f9f9; padding: 24px 40px; text-align:center;
                                                   border-top: 1px solid #eeeeee;">
                                        <p style="margin:0 0 6px; font-size:12px; color:#aaaaaa;">
                                            © 2026 SoilHealth AI. All rights reserved.
                                        </p>
                                        <p style="margin:0; font-size:12px; color:#aaaaaa;">
                                            Need help? Contact us at
                                            <a href="mailto:soilhealthproject.help@gmail.com"
                                               style="color:#1565c0; text-decoration:none;">
                                                soilhealthproject.help@gmail.com
                                            </a>
                                        </p>
                                    </td>
                                </tr>
                
                            </table>
                        </td>
                    </tr>
                </table>
                
                </body>
                </html>
                """.formatted(userName, otp);
    }

    public boolean validateEmail(String email) {

        String url = String.format(
                "https://api.sendbridge.com/v1/validate/%s/%s",
                sendBridgeApiToken,
                email
        );

        try {

            SendBridgeResponse response =
                    restTemplate.getForObject(url, SendBridgeResponse.class);

            if (response == null) {
                log.error("SendBridge API returned null response for email: {}", email);
                return false;
            }

            log.info("SendBridge validation response for {} : {}", email, response);

            return response.isValidSyntax() &&
                    response.isValidTld() &&
                    response.isMxValid() &&
                    response.isRcptExists() &&
                    !response.isTemporarilyUndeliverable();

        } catch (RestClientException e) {
            log.error("SendBridge API call failed for email: {}", email, e);
            return false;
        }
    }
}
