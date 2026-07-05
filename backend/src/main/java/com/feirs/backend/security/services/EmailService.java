package com.feirs.backend.security.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetLink) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("FEIRS - Reset Your Password");

        // Professional HTML Template with Cyan branding and Fingerprint theme
        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #020617;
                        color: #f8fafc;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 40px 20px;
                        background-color: #020617;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .logo-box {
                        background-color: rgba(8, 145, 178, 0.1);
                        border: 1px solid rgba(8, 145, 178, 0.5);
                        border-radius: 8px;
                        padding: 6px;
                        margin-right: 12px;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .logo-svg {
                        width: 24px;
                        height: 24px;
                    }
                    .title {
                        color: #ffffff;
                        font-size: 16px;
                        font-weight: 900;
                        margin: 0;
                        letter-spacing: -0.5px;
                        white-space: nowrap;
                    }
                    .subtitle {
                        color: #22d3ee;
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        margin-top: 5px;
                    }
                    .card {
                        background-color: rgba(15, 23, 42, 0.8);
                        border: 1px solid #1e293b;
                        border-radius: 24px;
                        padding: 40px;
                        text-align: center;
                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    }
                    .message {
                        color: #94a3b8;
                        font-size: 15px;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .button {
                        display: inline-block;
                        background-color: #0891b2;
                        color: #ffffff !important;
                        text-decoration: none;
                        font-weight: bold;
                        font-size: 16px;
                        padding: 16px 32px;
                        border-radius: 12px;
                        box-shadow: 0 0 20px rgba(8, 145, 178, 0.4);
                        transition: background-color 0.3s ease;
                    }
                    .button:hover {
                        background-color: #06b6d4;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        color: #475569;
                        font-size: 12px;
                    }
                    .warning {
                        font-size: 12px;
                        color: #ef4444;
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                        <tr>
                            <td align="center">
                                <table cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td valign="middle" style="padding-right: 12px;">
                                            <div class="logo-box" style="margin: 0;">
                                                <img src="https://img.icons8.com/ios-filled/96/22d3ee/fingerprint.png" alt="Fingerprint Logo" class="logo-svg" style="display: block;" />
                                            </div>
                                        </td>
                                        <td valign="middle">
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1; vertical-align: middle;">Fingerprint-based Emergency Identity Retrieval System</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="card">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
                        <p class="message">
                            We received a request to reset the password for your Super Admin account. 
                            If you initiated this request, please click the secure button below to set a new password.
                        </p>
                        <a href="{RESET_LINK}" class="button">Reset Password</a>
                        <p class="warning">
                            If you did not request this, please ignore this email. This link will expire in 10 minutes.
                        </p>
                    </div>
                    
                    <div class="footer">
                        &copy; 2026 FEIRS. All rights reserved. <br/>
                        This is an automated message. Do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
            """.replace("{RESET_LINK}", resetLink);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
