# Email OTP Verification - Password Reset

This document explains the email OTP verification system implemented for secure password reset functionality.

## Overview

The password reset flow has been upgraded from User ID-based verification to industry-standard email OTP (One-Time Password) verification for enhanced security and better user experience.

## Features

✅ **6-digit OTP** sent via email using SendGrid
✅ **10-minute expiry** on OTP codes
✅ **Rate limiting** to prevent abuse (60-second cooldown between requests)
✅ **Max 5 attempts** per OTP to prevent brute force attacks
✅ **Secure JWT token** for password reset after OTP verification
✅ **No user enumeration** - same response for existing/non-existing emails
✅ **Professional email template** with dark mode support
✅ **Resend OTP** functionality with cooldown timer
✅ **Auto-focus** OTP input fields with paste support

## Architecture

### Database Schema

**PasswordResetOTP Model:**
```prisma
model PasswordResetOTP {
  id         String   @id @default(cuid())
  email      String
  otp        String   // Hashed using bcrypt
  expiresAt  DateTime
  verified   Boolean  @default(false)
  attempts   Int      @default(0)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([email])
  @@index([expiresAt])
}
```

### API Endpoints

#### 1. Request OTP
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists with this email, you will receive a verification code",
  "expiresIn": 600
}
```

**Response (429 - Rate Limited):**
```json
{
  "error": "Please wait 45 seconds before requesting a new code",
  "remainingSeconds": 45
}
```

#### 2. Verify OTP
**POST** `/api/auth/forgot-password/verify`

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "OTP verified successfully",
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 - Invalid OTP):**
```json
{
  "error": "Invalid OTP code. 3 attempts remaining",
  "remainingAttempts": 3
}
```

#### 3. Reset Password
**POST** `/api/auth/forgot-password/reset`

**Request:**
```json
{
  "email": "user@example.com",
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully. You can now login with your new password."
}
```

## Setup Instructions

### 1. SendGrid Configuration

#### Step 1: Create SendGrid Account
1. Go to [SendGrid](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day)
3. Complete sender verification

#### Step 2: Verify Sender Email
1. Navigate to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your details:
   - **From Name:** SPARKS Support
   - **From Email:** noreply@sparks.lk (or your domain)
4. Verify the email address by clicking the link sent to your inbox

#### Step 3: Create API Key
1. Navigate to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name: `SPARKS Password Reset OTP`
4. Permissions: **Full Access** (or **Mail Send** only)
5. Copy the API key (you won't be able to see it again!)

#### Step 4: Add to Environment Variables
Update your `.env` file:

```env
# SendGrid Email Service (for OTP verification)
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@sparks.lk
SENDGRID_FROM_NAME=SPARKS Support
```

**Important:**
- The `SENDGRID_FROM_EMAIL` MUST match the verified sender email in SendGrid
- Never commit the API key to version control
- Use different API keys for development/staging/production

### 2. Database Schema

The `PasswordResetOTP` table has already been created. If you need to recreate it:

```bash
pnpm prisma db push
```

Or create a proper migration:

```bash
pnpm prisma migrate dev --name add_password_reset_otp
```

### 3. Test the Implementation

#### Manual Testing Steps:

1. **Request OTP:**
   - Go to `/forgot-password`
   - Enter a registered email address
   - Click "Send Verification Code"
   - Check the email inbox for the 6-digit code

2. **Verify OTP:**
   - Enter the 6-digit code from email
   - The code is valid for 10 minutes
   - You have 5 attempts to enter the correct code

3. **Reset Password:**
   - After successful OTP verification
   - Enter and confirm new password
   - Password must meet strength requirements
   - Click "Reset Password"

4. **Login:**
   - After successful reset, you'll be redirected to login
   - Use your email and new password

#### Testing Rate Limiting:

1. Request an OTP
2. Try to request another OTP immediately
3. You should receive a 429 error with remaining cooldown seconds
4. Wait 60 seconds and try again

#### Testing OTP Expiry:

1. Request an OTP
2. Wait 10+ minutes (or modify `OTP_CONFIG.EXPIRY_MINUTES` for testing)
3. Try to verify the expired OTP
4. You should receive an expiry error

## Configuration

All OTP-related configuration is centralized in `src/lib/otp-utils.ts`:

```typescript
export const OTP_CONFIG = {
    LENGTH: 6,                              // OTP digit length
    EXPIRY_MINUTES: 10,                     // OTP validity period
    MAX_ATTEMPTS: 5,                        // Max verification attempts
    RESEND_COOLDOWN_SECONDS: 60,            // Cooldown between OTP requests
    VERIFICATION_TOKEN_EXPIRY_MINUTES: 5    // Token validity after OTP verification
} as const;
```

To modify these values, update the `OTP_CONFIG` object.

## Email Template

The email template is located at `public/otp.html`. It features:

- Professional design with SPARKS branding
- Dark mode support
- Mobile-responsive layout
- Clear OTP display with monospace font
- Expiry time notice
- Security warning
- Support contact information

### Template Variables:

- `{{app_name}}` - Application name (SPARKS)
- `{{otp}}` - 6-digit OTP code
- `{{expiry_minutes}}` - Expiry time in minutes (10)
- `{{first_name}}` - User's first name (optional)
- `{{support_email}}` - Support email
- `{{year}}` - Current year
- `{{app_url}}` - Application URL

## Security Features

### 1. OTP Hashing
- OTPs are hashed using bcrypt before database storage
- Only hashed values are stored (salt rounds: 10)
- Even if database is compromised, OTPs cannot be recovered

### 2. JWT Verification Token
- **Properly signed JWT** using NEXTAUTH_SECRET
- Cannot be tampered with or forged
- Contains purpose field to prevent token misuse
- Auto-expires after 5 minutes
- Includes nonce for replay attack prevention

### 3. Rate Limiting
- 60-second cooldown between OTP requests per email
- Prevents OTP flooding and email spam
- Returns remaining cooldown seconds in error response

### 4. Attempt Limiting
- Maximum 5 verification attempts per OTP
- After 5 failed attempts, OTP is deleted
- User must request a new OTP

### 5. Time-based Expiry
- OTPs expire after 10 minutes
- Expired OTPs are automatically deleted
- Frontend shows countdown timer

### 6. No User Enumeration
- Same response for existing and non-existing emails
- Prevents attackers from discovering valid email addresses
- Maintains user privacy

### 7. HTTPS Only
- All API endpoints require HTTPS in production
- Prevents man-in-the-middle attacks
- SendGrid uses TLS for email transmission

## Troubleshooting

### Issue: Emails not being received

**Check:**
1. Verify `SENDGRID_API_KEY` is correct
2. Confirm `SENDGRID_FROM_EMAIL` matches verified sender in SendGrid
3. Check spam/junk folder
4. Verify SendGrid account is not suspended
5. Check SendGrid Activity Dashboard for delivery status

**Solutions:**
- Re-verify sender email in SendGrid
- Check API key permissions (needs Mail Send)
- Ensure you haven't exceeded SendGrid free tier limits (100/day)

### Issue: "SENDGRID_API_KEY is not configured"

**Solution:**
- Ensure `.env` file contains `SENDGRID_API_KEY`
- Restart the development server after adding env variables
- Check for typos in variable name

### Issue: OTP verification always fails

**Check:**
1. Ensure OTP hasn't expired (10 minutes)
2. Verify you're entering all 6 digits
3. Check if maximum attempts (5) exceeded
4. Confirm email matches the one used to request OTP

### Issue: Rate limiting too aggressive

**Solution:**
- Modify `OTP_CONFIG.RESEND_COOLDOWN_SECONDS` in `src/lib/otp-utils.ts`
- Consider different cooldowns for development vs production

### Issue: Email template not loading

**Check:**
1. Verify `public/otp.html` exists
2. Check file permissions
3. Ensure server has access to public directory

**Solution:**
- Restart development server
- Check console logs for template loading errors

## Production Checklist

Before deploying to production:

- [ ] Replace SendGrid API key with production key
- [ ] Use verified production domain email as sender
- [ ] Enable HTTPS for all endpoints
- [ ] Test with real user emails
- [ ] Monitor SendGrid Activity Dashboard
- [ ] Set up SendGrid email analytics
- [ ] Configure SendGrid webhook for bounce handling
- [ ] Add monitoring/logging for failed OTP sends
- [ ] Test rate limiting with real-world scenarios
- [ ] Review and adjust OTP_CONFIG values if needed
- [ ] Ensure `.env` is in `.gitignore`
- [ ] Document any environment-specific configurations

## File Structure

```
src/
├── app/
│   ├── forgot-password/
│   │   └── page.tsx                    # Frontend UI (3-step wizard)
│   └── api/
│       └── auth/
│           └── forgot-password/
│               ├── route.ts            # Step 1: Request OTP
│               ├── verify/
│               │   └── route.ts        # Step 2: Verify OTP
│               └── reset/
│                   └── route.ts        # Step 3: Reset Password
└── lib/
    ├── email-service.ts                # SendGrid email service
    └── otp-utils.ts                    # OTP generation & JWT signing
```

## Support

For issues or questions:
- Email: support@sparks.lk
- Check SendGrid Status: https://status.sendgrid.com/
- Review SendGrid Docs: https://docs.sendgrid.com/

## License

This implementation is part of the SPARKS platform.
