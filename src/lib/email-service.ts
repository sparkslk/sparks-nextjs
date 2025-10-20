import sgMail from '@sendgrid/mail';
import fs from 'fs';
import path from 'path';

class EmailService {
    private static instance: EmailService;
    private initialized: boolean = false;

    private constructor() {
        this.initialize();
    }

    private initialize() {
        if (this.initialized) return;

        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            console.error('SENDGRID_API_KEY is not configured');
            return;
        }

        sgMail.setApiKey(apiKey);
        this.initialized = true;
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    private getEmailTemplate(): string {
        try {
            const templatePath = path.join(process.cwd(), 'public', 'otp.html');
            return fs.readFileSync(templatePath, 'utf-8');
        } catch (error) {
            console.error('Error reading email template:', error);
            throw new Error('Failed to load email template');
        }
    }

    private replaceTemplateVariables(template: string, variables: Record<string, string>): string {
        let result = template;

        // Replace standard variables
        Object.entries(variables).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, value);
        });

        // Handle conditional blocks (Handlebars-style)
        // Remove {{#if verify_url}} block since we don't use it for password reset
        result = result.replace(/{{#if verify_url}}[\s\S]*?{{\/if}}/g, '');

        // Handle {{#if first_name}} blocks
        if (variables.first_name) {
            result = result.replace(/{{#if first_name}}/g, '');
            result = result.replace(/{{\/if}}/g, '');
        } else {
            // Remove the conditional and its content if first_name doesn't exist
            result = result.replace(/{{#if first_name}}[^{]*{{\/if}}/g, '');
        }

        // Clean up any remaining handlebars syntax
        result = result.replace(/{{#if [^}]+}}/g, '');
        result = result.replace(/{{\/if}}/g, '');

        return result;
    }

    public async sendPasswordResetOTP(email: string, otp: string, firstName?: string): Promise<boolean> {
        if (!this.initialized) {
            console.error('EmailService is not properly initialized');
            return false;
        }

        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
        const fromName = process.env.SENDGRID_FROM_NAME || 'SPARKS Support';

        if (!fromEmail) {
            console.error('SENDGRID_FROM_EMAIL is not configured');
            return false;
        }

        try {
            const template = this.getEmailTemplate();
            const htmlContent = this.replaceTemplateVariables(template, {
                app_name: 'SPARKS',
                otp: otp,
                expiry_minutes: '10',
                first_name: firstName || '',
                support_email: 'support@sparks.lk',
                year: new Date().getFullYear().toString(),
                app_url: process.env.NEXTAUTH_URL || 'https://sparks.lk'
            });

            const msg = {
                to: email,
                from: {
                    email: fromEmail,
                    name: fromName
                },
                subject: 'Password Reset Verification Code - SPARKS',
                html: htmlContent,
                text: `Your SPARKS password reset verification code is: ${otp}. This code expires in 10 minutes. If you didn't request this, please ignore this email.`
            };

            await sgMail.send(msg);
            console.log(`Password reset OTP email sent successfully to ${email}`);
            return true;
        } catch (error) {
            console.error('Error sending email:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
            return false;
        }
    }
}

export const emailService = EmailService.getInstance();
