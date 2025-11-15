# Authentication System Specification Document

## Table of Contents

1. [Overview](#overview)
2. [User Authentication](#user-authentication)
3. [Admin Authentication](#admin-authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Security Features](#security-features)
7. [Error Handling](#error-handling)
8. [Validation Rules](#validation-rules)
9. [Flow Diagrams](#flow-diagrams)

---

## Overview

The Trio-Order application implements a dual authentication system supporting both **User** and **Admin** roles. The system includes:

- **User Authentication**: Self-service registration with email verification
- **Admin Authentication**: Registration with owner approval workflow
- **Email Verification**: PIN-based verification system (6-digit PIN, 15-minute expiration)
- **Password Security**: bcrypt hashing with salt rounds
- **JWT Tokens**: Token-based authentication for session management
- **Account Management**: Activity tracking, account status management

---

## User Authentication

### User Signup/Registration

#### Process Flow

1. User submits registration form with `username`, `email`, and `password`
2. System validates input data
3. System checks if email already exists
4. If email exists but not verified → Resend verification PIN
5. If email doesn't exist → Create new user account
6. Hash password using bcrypt (salt rounds: 10)
7. Generate 6-digit verification PIN
8. Set PIN expiration (15 minutes from creation)
9. Save user to database with `isVerified: false`
10. Send verification email with PIN
11. Return success response with `needsVerification: true`

#### Requirements

**Input Fields:**

- `username` (String, required)
- `email` (String, required, must be valid email format)
- `password` (String, required, minimum 8 characters)

**Validation Rules:**

- Email must be valid format (using validator library)
- Password must be at least 8 characters long
- Email must be unique (not already registered and verified)

**Response Scenarios:**

| Scenario                     | Success | Message                                                                                        | Additional Fields                  |
| ---------------------------- | ------- | ---------------------------------------------------------------------------------------------- | ---------------------------------- |
| New user registered          | `true`  | "Registration successful! Please check your email for verification PIN."                       | `needsVerification: true`, `email` |
| User exists but not verified | `false` | "Account already exists but not verified. A new verification PIN has been sent to your email." | `needsVerification: true`, `email` |
| User exists and verified     | `false` | "User already exists and is verified. Please login."                                           | -                                  |
| Invalid email format         | `false` | "Please enter a valid email"                                                                   | -                                  |
| Password too short           | `false` | "Password must be at least 8 characters long"                                                  | -                                  |
| Email sending failed         | `true`  | "Account created! However, email sending failed. Please use 'Resend PIN' option."              | `needsVerification: true`, `email` |

**API Endpoint:**

```
POST /api/user/register
```

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Registration successful! Please check your email for verification PIN.",
  "needsVerification": true,
  "email": "john@example.com"
}
```

---

### User Email Verification

#### Process Flow

1. User submits email and PIN received via email
2. System finds user by email
3. Check if user exists
4. Check if already verified
5. Verify PIN matches stored PIN
6. Verify PIN hasn't expired (15 minutes)
7. Mark user as verified (`isVerified: true`)
8. Clear verification PIN and expiration
9. Generate JWT token
10. Return token and user data

#### Requirements

**Input Fields:**

- `email` (String, required)
- `pin` (String, required, 6 digits)

**Response Scenarios:**

| Scenario                    | Success | Message                                               | Additional Fields      |
| --------------------------- | ------- | ----------------------------------------------------- | ---------------------- |
| Email verified successfully | `true`  | "Email verified successfully! You can now login."     | `token`, `user` object |
| User not found              | `false` | "User not found"                                      | -                      |
| Already verified            | `false` | "Email already verified. Please login."               | -                      |
| Invalid PIN                 | `false` | "Invalid PIN. Please check and try again."            | -                      |
| PIN expired                 | `false` | "PIN expired. Please request a new verification PIN." | `expired: true`        |

**API Endpoint:**

```
POST /api/user/verify-email
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "pin": "123456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

---

### User Login

#### Process Flow

1. User submits email and password
2. System finds user by email
3. Check if user exists
4. Check if email is verified (`isVerified: true`)
5. Check if account is active (`isActive: true`)
6. Compare password with hashed password using bcrypt
7. Update `lastActive` timestamp
8. Set `isActive: true`
9. Generate JWT token
10. Return token and user data

#### Requirements

**Input Fields:**

- `email` (String, required)
- `password` (String, required)

**Response Scenarios:**

| Scenario            | Success | Message                                                                           | Additional Fields                  |
| ------------------- | ------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| Login successful    | `true`  | -                                                                                 | `token`, `user` object             |
| User doesn't exist  | `false` | "User doesn't exist"                                                              | -                                  |
| Email not verified  | `false` | "Please verify your email first. Check your inbox for verification PIN."          | `needsVerification: true`, `email` |
| Account deactivated | `false` | "Your account has been deactivated. Please contact administrator for assistance." | `accountDeactivated: true`         |
| Invalid password    | `false` | "Invalid password"                                                                | -                                  |

**API Endpoint:**

```
POST /api/user/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "profilePhoto": "/uploads/profile-photo.jpg"
  }
}
```

---

### User Resend Verification PIN

**API Endpoint:**

```
POST /api/user/resend-verification
```

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "New verification PIN sent to your email"
}
```

---

## Admin Authentication

### Admin Signup/Registration

#### Process Flow

1. Admin submits registration form with `username`, `email`, and `password`
2. System validates input data
3. System checks if email already exists
4. If email exists:
   - If pending approval → Return pending approval message
   - If approved but not verified → Return needs verification message
   - If verified → Return already exists message
5. If email doesn't exist → Create new admin account
6. Hash password using bcrypt (salt rounds: 10)
7. Generate approval token (32-byte hex string)
8. Create admin with `isApprovedByOwner: false`, `isVerified: false`
9. Send approval request email to owner
10. If email fails → Delete admin record and return error
11. Return success response with `pendingApproval: true`

#### Requirements

**Input Fields:**

- `username` (String, required)
- `email` (String, required, must be valid email format)
- `password` (String, required, minimum 8 characters)

**Validation Rules:**

- Email must be valid format
- Password must be at least 8 characters long
- Email must be unique

**Response Scenarios:**

| Scenario                  | Success | Message                                                                                               | Additional Fields                  |
| ------------------------- | ------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Registration request sent | `true`  | "Registration request sent! Please wait for owner approval. You will receive an email once approved." | `pendingApproval: true`            |
| Pending owner approval    | `false` | "Your registration is pending owner approval. Please wait for confirmation email."                    | `pendingApproval: true`            |
| Approved but not verified | `false` | "Your account was approved. Please check your email for verification PIN."                            | `needsVerification: true`, `email` |
| Already verified          | `false` | "Admin already exists and is verified. Please login."                                                 | -                                  |
| Invalid email format      | `false` | "Please enter a valid email"                                                                          | -                                  |
| Password too short        | `false` | "Password must be at least 8 characters long"                                                         | -                                  |
| Email sending failed      | `false` | "Failed to send approval request to owner. Please try again later."                                   | -                                  |

**API Endpoint:**

```
POST /api/admin/register
```

**Request Body:**

```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Registration request sent! Please wait for owner approval. You will receive an email once approved.",
  "pendingApproval": true
}
```

---

### Owner Approval Process

#### Process Flow

1. Owner receives approval request email with approval/rejection links
2. Owner clicks approval link: `/api/admin/approve/:token`
3. System finds admin by `approvalToken`
4. Check if admin exists and not already approved
5. Generate 6-digit verification PIN
6. Set `isApprovedByOwner: true`
7. Clear `approvalToken`
8. Set `verificationPin` and `verificationPinExpires` (15 minutes)
9. Send approval notification email to admin with verification PIN
10. Display success page

**API Endpoint:**

```
GET /api/admin/approve/:token
```

**Response:** HTML page confirming approval

---

### Admin Email Verification

#### Process Flow

1. Admin submits email and PIN received via email (after owner approval)
2. System finds admin by email
3. Check if admin exists
4. Check if already verified
5. Verify PIN matches stored PIN
6. Verify PIN hasn't expired (15 minutes)
7. Mark admin as verified (`isVerified: true`)
8. Clear verification PIN and expiration
9. Generate JWT token with `role: 'admin'`
10. Return token and admin data

#### Requirements

**Input Fields:**

- `email` (String, required)
- `pin` (String, required, 6 digits)

**Response Scenarios:**

| Scenario                    | Success | Message                                               | Additional Fields       |
| --------------------------- | ------- | ----------------------------------------------------- | ----------------------- |
| Email verified successfully | `true`  | "Email verified successfully! You can now login."     | `token`, `admin` object |
| Admin not found             | `false` | "Admin not found"                                     | -                       |
| Already verified            | `false` | "Email already verified. Please login."               | -                       |
| Invalid PIN                 | `false` | "Invalid PIN. Please check and try again."            | -                       |
| PIN expired                 | `false` | "PIN expired. Please request a new verification PIN." | `expired: true`         |

**API Endpoint:**

```
POST /api/admin/verify-email
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "pin": "123456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully! You can now login.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### Admin Login

#### Process Flow

1. Admin submits email and password
2. System finds admin by email
3. Check if admin exists
4. Check if owner approved (`isApprovedByOwner: true`)
5. Check if email is verified (`isVerified: true`)
6. Compare password with hashed password using bcrypt
7. Update `lastLogin` timestamp
8. Generate JWT token with `role: 'admin'`
9. Return token and admin data

#### Requirements

**Input Fields:**

- `email` (String, required)
- `password` (String, required)

**Response Scenarios:**

| Scenario               | Success | Message                                                                            | Additional Fields                  |
| ---------------------- | ------- | ---------------------------------------------------------------------------------- | ---------------------------------- |
| Login successful       | `true`  | -                                                                                  | `token`, `admin` object            |
| Admin doesn't exist    | `false` | "Admin account doesn't exist"                                                      | -                                  |
| Pending owner approval | `false` | "Your registration is pending owner approval. Please wait for confirmation email." | `pendingApproval: true`            |
| Email not verified     | `false` | "Please verify your email first. Check your inbox for verification PIN."           | `needsVerification: true`, `email` |
| Invalid password       | `false` | "Invalid password"                                                                 | -                                  |

**API Endpoint:**

```
POST /api/admin/login
```

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "adminpassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "507f1f77bcf86cd799439012",
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### Admin Resend Verification PIN

**API Endpoint:**

```
POST /api/admin/resend-verification
```

**Request Body:**

```json
{
  "email": "admin@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "New verification PIN sent to your email"
}
```

---

## API Endpoints

### User Authentication Endpoints

| Method | Endpoint                        | Description                | Auth Required |
| ------ | ------------------------------- | -------------------------- | ------------- |
| POST   | `/api/user/register`            | Register new user          | No            |
| POST   | `/api/user/login`               | User login                 | No            |
| POST   | `/api/user/verify-email`        | Verify user email with PIN | No            |
| POST   | `/api/user/resend-verification` | Resend verification PIN    | No            |
| POST   | `/api/user/forgot-password`     | Request password reset     | No            |
| POST   | `/api/user/verify-reset-pin`    | Verify password reset PIN  | No            |
| POST   | `/api/user/reset-password`      | Reset password with PIN    | No            |
| PUT    | `/api/user/profile-photo`       | Update profile photo       | Yes (User)    |

### Admin Authentication Endpoints

| Method | Endpoint                         | Description                 | Auth Required    |
| ------ | -------------------------------- | --------------------------- | ---------------- |
| POST   | `/api/admin/register`            | Register new admin          | No               |
| POST   | `/api/admin/login`               | Admin login                 | No               |
| GET    | `/api/admin/approve/:token`      | Owner approves admin        | No (Token-based) |
| GET    | `/api/admin/reject/:token`       | Owner rejects admin         | No (Token-based) |
| POST   | `/api/admin/verify-email`        | Verify admin email with PIN | No               |
| POST   | `/api/admin/resend-verification` | Resend verification PIN     | No               |
| POST   | `/api/admin/forgot-password`     | Request password reset      | No               |
| POST   | `/api/admin/verify-reset-pin`    | Verify password reset PIN   | No               |
| POST   | `/api/admin/reset-password`      | Reset password with PIN     | No               |

---

## Data Models

### User Model

```javascript
{
  username: String (required),
  email: String (required, unique),
  phone: String (optional),
  profilePhoto: String (optional),
  password: String (required, hashed),
  isVerified: Boolean (default: false),
  verificationPin: String (optional),
  verificationPinExpires: Date (optional),
  resetPin: String (optional),
  resetPinExpires: Date (optional),
  lastActive: Date (default: Date.now),
  isActive: Boolean (default: true),
  createdAt: Date (default: Date.now)
}
```

### Admin Model

```javascript
{
  username: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'superadmin'], default: 'admin'),
  isApprovedByOwner: Boolean (default: false),
  approvalToken: String (optional),
  isVerified: Boolean (default: false),
  verificationPin: String (optional),
  verificationPinExpires: Date (optional),
  resetPin: String (optional),
  resetPinExpires: Date (optional),
  createdAt: Date (default: Date.now),
  lastLogin: Date (optional)
}
```

---

## Security Features

### Password Security

- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Minimum Length**: 8 characters
- **Storage**: Passwords are never stored in plain text

### Token Security

- **Algorithm**: JWT (JSON Web Token)
- **Secret**: Stored in environment variable (`JWT_SECRET`)
- **User Tokens**: Contains `{ id, email }`
- **Admin Tokens**: Contains `{ id, email, role: 'admin' }`
- **Token Validation**: Middleware checks token validity and role

### Email Verification

- **PIN Format**: 6-digit numeric PIN
- **PIN Expiration**: 15 minutes from generation
- **PIN Storage**: Stored in database, cleared after verification
- **Resend Limit**: No explicit limit (can be implemented)

### Account Security

- **User Accounts**: Can be deactivated by admin (`isActive: false`)
- **Admin Accounts**: Require owner approval before activation
- **Activity Tracking**: Last active timestamp tracked for users
- **Login Tracking**: Last login timestamp tracked for admins

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error message describing the issue"
}
```

### HTTP Status Codes

| Status Code | Usage                                                       |
| ----------- | ----------------------------------------------------------- |
| 200         | Success (even for failures, success field indicates status) |
| 401         | Unauthorized (missing or invalid token)                     |
| 403         | Forbidden (insufficient permissions)                        |
| 404         | Not Found (resource not found)                              |
| 500         | Internal Server Error                                       |

### Error Messages

**User Authentication:**

- "User doesn't exist"
- "Please verify your email first. Check your inbox for verification PIN."
- "Your account has been deactivated. Please contact administrator for assistance."
- "Invalid password"
- "User already exists and is verified. Please login."
- "Please enter a valid email"
- "Password must be at least 8 characters long"

**Admin Authentication:**

- "Admin account doesn't exist"
- "Your registration is pending owner approval. Please wait for confirmation email."
- "Please verify your email first. Check your inbox for verification PIN."
- "Invalid password"
- "Admin already exists and is verified. Please login."

---

## Validation Rules

### Email Validation

- Must be valid email format (using `validator.isEmail()`)
- Must be unique in the respective collection (User or Admin)
- Case-insensitive matching

### Password Validation

- **Minimum Length**: 8 characters
- **No Maximum Length**: (can be implemented)
- **Character Requirements**: None (can be enhanced)

### Username Validation

- Currently no explicit validation (can be enhanced)
- Should be unique per collection (can be enforced)

### PIN Validation

- **Format**: 6-digit numeric string
- **Expiration**: 15 minutes from generation
- **Single Use**: PIN is cleared after successful verification

---

## Flow Diagrams

### User Registration Flow

```
User Registration
    ↓
Validate Input
    ↓
Email Exists?
    ├─ Yes → Already Verified?
    │   ├─ Yes → Return "Already exists"
    │   └─ No → Resend Verification PIN
    └─ No → Create New User
        ↓
Hash Password
    ↓
Generate Verification PIN
    ↓
Save to Database (isVerified: false)
    ↓
Send Verification Email
    ↓
Return Success (needsVerification: true)
```

### User Login Flow

```
User Login
    ↓
Find User by Email
    ↓
User Exists?
    ├─ No → Return "User doesn't exist"
    └─ Yes → Check Verification Status
        ↓
    isVerified?
        ├─ No → Return "Verify email first"
        └─ Yes → Check Account Status
            ↓
        isActive?
            ├─ No → Return "Account deactivated"
            └─ Yes → Verify Password
                ↓
            Password Match?
                ├─ No → Return "Invalid password"
                └─ Yes → Update lastActive
                    ↓
                Generate JWT Token
                    ↓
                Return Token & User Data
```

### Admin Registration Flow

```
Admin Registration
    ↓
Validate Input
    ↓
Email Exists?
    ├─ Yes → Check Status
    │   ├─ Pending Approval → Return "Pending approval"
    │   ├─ Approved but Not Verified → Return "Needs verification"
    │   └─ Verified → Return "Already exists"
    └─ No → Create New Admin
        ↓
Hash Password
    ↓
Generate Approval Token
    ↓
Save to Database (isApprovedByOwner: false, isVerified: false)
    ↓
Send Approval Request to Owner
    ↓
Email Sent?
    ├─ No → Delete Admin & Return Error
    └─ Yes → Return Success (pendingApproval: true)
```

### Owner Approval Flow

```
Owner Clicks Approval Link
    ↓
Find Admin by Approval Token
    ↓
Admin Exists & Not Approved?
    ├─ No → Return "Invalid Request"
    └─ Yes → Generate Verification PIN
        ↓
    Set isApprovedByOwner: true
        ↓
    Clear Approval Token
        ↓
    Set Verification PIN & Expiration
        ↓
    Send Approval Notification to Admin
        ↓
    Display Success Page
```

### Admin Login Flow

```
Admin Login
    ↓
Find Admin by Email
    ↓
Admin Exists?
    ├─ No → Return "Admin doesn't exist"
    └─ Yes → Check Owner Approval
        ↓
    isApprovedByOwner?
        ├─ No → Return "Pending approval"
        └─ Yes → Check Verification Status
            ↓
        isVerified?
            ├─ No → Return "Verify email first"
            └─ Yes → Verify Password
                ↓
            Password Match?
                ├─ No → Return "Invalid password"
                └─ Yes → Update lastLogin
                    ↓
                Generate JWT Token (with role: 'admin')
                    ↓
                Return Token & Admin Data
```

---

## Additional Features

### Password Reset Flow

Both users and admins can reset their passwords using a PIN-based system:

1. Request password reset → Receive PIN via email
2. Verify reset PIN
3. Reset password with new password and verified PIN

**Endpoints:**

- `POST /api/user/forgot-password`
- `POST /api/user/verify-reset-pin`
- `POST /api/user/reset-password`
- `POST /api/admin/forgot-password`
- `POST /api/admin/verify-reset-pin`
- `POST /api/admin/reset-password`

### Account Management

**User Accounts:**

- Admin can view all users (`GET /api/user/all`)
- Admin can toggle user active status (`POST /api/user/toggle-status`)
- User activity is tracked (`lastActive` timestamp)

**Admin Accounts:**

- Owner can approve/reject admin registrations via email links
- Admin login activity is tracked (`lastLogin` timestamp)

---

## Frontend Integration

### Token Storage

- **User Tokens**: Stored in `localStorage` as `authToken`
- **Admin Tokens**: Stored in `localStorage` as `token`
- **User Info**: Stored in `localStorage` as `user` (JSON string)
- **Admin Info**: Stored in `localStorage` as `admin` (JSON string)

### Remember Me Feature

- Login credentials can be stored in `localStorage` for "Remember Me" functionality
- User: `loginData`
- Admin: `adminLoginData`

### Protected Routes

- **User Routes**: Protected by `authMiddleware` (checks user token)
- **Admin Routes**: Protected by `adminAuthMiddleware` (checks admin token and role)

---

## Environment Variables

Required environment variables:

- `JWT_SECRET`: Secret key for JWT token signing
- Email service configuration (SMTP settings, etc.)

---

## Testing Scenarios

### User Registration Tests

1. ✅ Successful registration with valid data
2. ✅ Registration with existing email (not verified) → Resend PIN
3. ✅ Registration with existing email (verified) → Error
4. ✅ Registration with invalid email format
5. ✅ Registration with short password (< 8 characters)
6. ✅ Email sending failure handling

### User Login Tests

1. ✅ Successful login with verified account
2. ✅ Login with unverified email → Needs verification
3. ✅ Login with deactivated account → Account deactivated message
4. ✅ Login with incorrect password
5. ✅ Login with non-existent email

### Admin Registration Tests

1. ✅ Successful registration request
2. ✅ Registration with existing email (pending) → Pending approval
3. ✅ Registration with existing email (approved, not verified) → Needs verification
4. ✅ Registration with existing email (verified) → Already exists
5. ✅ Email sending failure → Registration deleted

### Admin Login Tests

1. ✅ Successful login with approved and verified admin
2. ✅ Login with pending approval → Pending approval message
3. ✅ Login with unverified email → Needs verification
4. ✅ Login with incorrect password
5. ✅ Login with non-existent email

---

## Version History

- **Version 1.0** - Initial specification document
- Created: Based on current implementation in Trio-Order application

---

## Notes

- All timestamps are in UTC
- PIN expiration is 15 minutes from generation
- Password hashing uses bcrypt with 10 salt rounds
- JWT tokens do not have explicit expiration (can be added)
- Email verification is required before login for both users and admins
- Admin accounts require owner approval before email verification
- User accounts can be deactivated by admin, preventing login
- Activity tracking helps monitor user engagement

---

**Document Status**: Complete
**Last Updated**: Based on current codebase implementation
