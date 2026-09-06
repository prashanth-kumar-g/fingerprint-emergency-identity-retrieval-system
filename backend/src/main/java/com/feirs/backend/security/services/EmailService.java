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
						font-size: 14px;
						font-weight: 900;
						margin: 0;
						letter-spacing: 0.1px;
						white-space: normal;
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
                        white-space: nowrap;
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
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
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
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1.3; vertical-align: middle;">Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System</h1>
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

    public void sendInstitutionApprovalEmail(String toEmail, String institutionName, String activateLink) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("FEIRS - Institution Application Approved");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; }
                    .logo-box { background-color: rgba(8, 145, 178, 0.1); border: 1px solid rgba(8, 145, 178, 0.5); border-radius: 8px; padding: 6px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center; }
                    .logo-svg { width: 24px; height: 24px; }
                    .title { color: #ffffff; font-size: 14px; font-weight: 900; margin: 0; letter-spacing: -0.5px; white-space: normal; }
                    .card { background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                    .message { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
                    .button { white-space: nowrap; display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 16px; padding: 16px 32px; border-radius: 12px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); transition: background-color 0.3s ease; }
                    .button:hover { background-color: #059669; }
                    .footer { text-align: center; margin-top: 30px; color: #475569; font-size: 12px; }
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
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
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1.3; vertical-align: middle;">Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="card">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Application Approved</h2>
                        <p class="message">
                            Congratulations! The FEIRS network application for <strong>{INSTITUTION_NAME}</strong> has been approved by the Super Admin.
                            Please click the secure button below to activate your account and set up your password.
                        </p>
                        <a href="{ACTIVATE_LINK}" class="button">Activate Account</a>
                    </div>
                    <div class="footer">
                        &copy; 2026 FEIRS. All rights reserved. <br/>
                        This is an automated message. Do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
            """.replace("{INSTITUTION_NAME}", institutionName).replace("{ACTIVATE_LINK}", activateLink);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendInstitutionRejectionEmail(String toEmail, String institutionName, String reason) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("FEIRS - Institution Application Status");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; }
                    .logo-box { background-color: rgba(8, 145, 178, 0.1); border: 1px solid rgba(8, 145, 178, 0.5); border-radius: 8px; padding: 6px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center; }
                    .logo-svg { width: 24px; height: 24px; }
					.title { color: #ffffff; font-size: 14px; font-weight: 900; margin: 0; letter-spacing: -0.5px; white-space: normal; }
                    .card { background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                    .message { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
                    .reason-box { background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 15px; border-radius: 8px; color: #fca5a5; font-size: 14px; text-align: left; margin-bottom: 30px; }
                    .footer { text-align: center; margin-top: 30px; color: #475569; font-size: 12px; }
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
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
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1.3; vertical-align: middle;">Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="card">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Application Update</h2>
                        <p class="message">
                            Thank you for applying to join the FEIRS network on behalf of <strong>{INSTITUTION_NAME}</strong>.
                            Unfortunately, after careful review, your application could not be approved at this time.
                        </p>
                        <div class="reason-box">
                            <strong>Reason:</strong><br/>
                            {REASON}
                        </div>
                    </div>
                    <div class="footer">
                        &copy; 2026 FEIRS. All rights reserved. <br/>
                        This is an automated message. Do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
            """.replace("{INSTITUTION_NAME}", institutionName).replace("{REASON}", reason);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendOperatorEnrollmentOtp(String toEmail, String otp, String operatorName, String institutionName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("FEIRS - Operator Enrollment Verification OTP");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; }
                    .logo-box { background-color: rgba(8, 145, 178, 0.1); border: 1px solid rgba(8, 145, 178, 0.5); border-radius: 8px; padding: 6px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center; }
                    .logo-svg { width: 24px; height: 24px; }
                    .title { color: #ffffff; font-size: 14px; font-weight: 900; margin: 0; letter-spacing: -0.5px; white-space: normal; }
                    .card { background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                    .message { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
                    .otp-box { display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 2px dashed rgba(16, 185, 129, 0.5); color: #10b981; font-size: 32px; font-weight: bold; padding: 15px 40px; border-radius: 12px; letter-spacing: 5px; margin-bottom: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #475569; font-size: 12px; }
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
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
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1.3; vertical-align: middle;">Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="card">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Operator Enrollment OTP</h2>
                        <p class="message">
                            Hello <strong>{OPERATOR_NAME}</strong>,<br/><br/>
                            An Institution Admin from <strong>{INSTITUTION_NAME}</strong> is attempting to enroll you as an operator in the FEIRS network. Please provide the OTP below to the admin to complete your enrollment.
                        </p>
                        <div class="otp-box">
                            {OTP_CODE}
                        </div>
                        <p class="message" style="margin-top: 10px; font-size: 13px;">
                            This OTP is valid for 10 minutes. Do not share it with anyone other than your Institution Admin.
                        </p>
                    </div>
                    <div class="footer">
                        &copy; 2026 FEIRS. All rights reserved. <br/>
                        This is an automated message. Do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
            """
            .replace("{OPERATOR_NAME}", operatorName != null ? operatorName : "Operator")
            .replace("{INSTITUTION_NAME}", institutionName != null ? institutionName : "Institution")
            .replace("{OTP_CODE}", otp);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendOperatorActivationEmail(String toEmail, String operatorName, String activateLink, String institutionName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("FEIRS - Operator Account Activation");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; }
                    .logo-box { background-color: rgba(8, 145, 178, 0.1); border: 1px solid rgba(8, 145, 178, 0.5); border-radius: 8px; padding: 6px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center; }
                    .logo-svg { width: 24px; height: 24px; }
                    .title { color: #ffffff; font-size: 14px; font-weight: 900; margin: 0; letter-spacing: -0.5px; white-space: normal; }
                    .card { background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                    .message { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
                    .button { white-space: nowrap; display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 16px; padding: 16px 32px; border-radius: 12px; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); transition: background-color 0.3s ease; }
                    .button:hover { background-color: #059669; }
                    .footer { text-align: center; margin-top: 30px; color: #475569; font-size: 12px; }
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
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
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1.3; vertical-align: middle;">Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="card">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Operator Enrollment Approved</h2>
                        <p class="message">
                            Congratulations <strong>{OPERATOR_NAME}</strong>! You have been successfully enrolled as an operator for <strong>{INSTITUTION_NAME}</strong> in the FEIRS network.
                            Please click the secure button below to activate your account and set up your password.
                        </p>
                        <a href="{ACTIVATE_LINK}" class="button">Activate Account</a>
                    </div>
                    <div class="footer">
                        &copy; 2026 FEIRS. All rights reserved. <br/>
                        This is an automated message. Do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
            """
            .replace("{OPERATOR_NAME}", operatorName != null ? operatorName : "Operator")
            .replace("{INSTITUTION_NAME}", institutionName != null ? institutionName : "Institution")
            .replace("{ACTIVATE_LINK}", activateLink);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendCitizenEnrollmentOtp(String toEmail, String otp, String citizenName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("FEIRS - Citizen Enrollment Verification OTP");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; }
                    .logo-box { background-color: rgba(8, 145, 178, 0.1); border: 1px solid rgba(8, 145, 178, 0.5); border-radius: 8px; padding: 6px; margin-right: 12px; display: inline-flex; align-items: center; justify-content: center; }
                    .logo-svg { width: 24px; height: 24px; }
                    .title { color: #ffffff; font-size: 14px; font-weight: 900; margin: 0; letter-spacing: -0.5px; white-space: normal; }
                    .card { background-color: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
                    .message { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 30px; }
                    .otp-box { display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 2px dashed rgba(16, 185, 129, 0.5); color: #10b981; font-size: 32px; font-weight: bold; padding: 15px 40px; border-radius: 12px; letter-spacing: 5px; margin-bottom: 20px; }
                    .footer { text-align: center; margin-top: 30px; color: #475569; font-size: 12px; }
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
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
                                            <h1 class="title" style="margin: 0; padding: 0; line-height: 1.3; vertical-align: middle;">Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System</h1>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="card">
                        <h2 style="color: #ffffff; font-size: 20px; margin-top: 0;">Citizen Enrollment OTP</h2>
                        <p class="message">
                            Hello <strong>{CITIZEN_NAME}</strong>,<br/><br/>
                            An Operator is attempting to enroll you into the FEIRS network. Please provide the OTP below to the operator to verify your email address and complete your enrollment.
                        </p>
                        <div class="otp-box">
                            {OTP_CODE}
                        </div>
                        <p class="message" style="margin-top: 10px; font-size: 13px;">
                            This OTP is valid for 10 minutes. Do not share it with anyone other than the Operator.
                        </p>
                    </div>
                    <div class="footer">
                        &copy; 2026 FEIRS. All rights reserved. <br/>
                        This is an automated message. Do not reply to this email.
                    </div>
                </div>
            </body>
            </html>
            """
            .replace("{CITIZEN_NAME}", citizenName != null ? citizenName : "Citizen")
            .replace("{OTP_CODE}", otp);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }

    public void sendEmergencyAlertToContact(String toEmail, String contactName, String citizenName) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(toEmail);
        helper.setSubject("URGENT: FEIRS - Emergency Medical Alert");

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Inter', Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #020617; }
                    .card { background-color: rgba(15, 23, 42, 0.8); border: 2px solid #ef4444; border-radius: 24px; padding: 40px; text-align: center; box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.5); }
                    .title { color: #ef4444; font-size: 24px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
                    .message { color: #94a3b8; font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
                    .highlight { color: #ffffff; font-weight: bold; }
                @media only screen and (max-width: 600px) { .mobile-indent { border-left: 15.75px solid transparent !important; } }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <h1 class="title">🚨 EMERGENCY ALERT</h1>
                        <p class="message">
                            Dear <span class="highlight">%s</span>,<br><br>
                            This is an automated emergency notification from the Fingerprint-based Emergency <span class="mobile-indent">Identity</span> Retrieval System (FEIRS).<br><br>
                            <span class="highlight">%s</span> has just been identified by an emergency responder via biometric scan.<br><br>
                            Their critical medical profile has been retrieved by the medical team. Please contact the local emergency services immediately for more information.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(contactName, citizenName);

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
