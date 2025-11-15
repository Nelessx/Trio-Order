import adminModel from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import crypto from "crypto";
import { generatePin, sendVerificationEmail, sendPasswordResetEmail, sendOwnerApprovalRequest, sendAdminApprovedNotification } from "../utils/emailService.js";

const OWNER_EMAIL = "triotrick0630@gmail.com";

// create a token
const createAdminToken = (id, email) => {
  return jwt.sign({ id, email, role: 'admin' }, process.env.JWT_SECRET);
};

// Admin login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Admin account doesn't exist" });
    }

    // Check if owner approved
    if (!admin.isApprovedByOwner) {
      return res.json({ 
        success: false, 
        message: "Your registration is pending owner approval. Please wait for confirmation email.",
        pendingApproval: true
      });
    }

    // Check if email is verified
    if (!admin.isVerified) {
      return res.json({ 
        success: false, 
        message: "Please verify your email first. Check your inbox for verification PIN.",
        needsVerification: true,
        email: admin.email
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid password" });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    const token = createAdminToken(admin._id, admin.email);
    res.json({ 
      success: true, 
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.json({ success: false, message: "Login failed" });
  }
};

// Admin register
const registerAdmin = async (req, res) => {
  const { username, password, email } = req.body;
  try {
    const exists = await adminModel.findOne({ email });

    if (exists) {
      // If admin exists but pending approval
      if (!exists.isApprovedByOwner) {
        return res.json({ 
          success: false, 
          message: "Your registration is pending owner approval. Please wait for confirmation email.",
          pendingApproval: true
        });
      }
      // If approved but not verified
      if (exists.isApprovedByOwner && !exists.isVerified) {
        return res.json({ 
          success: false, 
          message: "Your account was approved. Please check your email for verification PIN.",
          needsVerification: true,
          email: email
        });
      }
      return res.json({ success: false, message: "Admin already exists and is verified. Please login." });
    }

    // validation
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate approval token
    const approvalToken = crypto.randomBytes(32).toString('hex');

    // create new admin (pending owner approval)
    const newAdmin = new adminModel({
      username: username,
      email: email,
      password: hashedPassword,
      isApprovedByOwner: false,
      approvalToken: approvalToken,
      isVerified: false,
      verificationPin: null,
      verificationPinExpires: null
    });

    const admin = await newAdmin.save();
    console.log('✅ Admin saved to database (pending approval):', admin._id);

    // Send approval request to owner
    try {
      await sendOwnerApprovalRequest(OWNER_EMAIL, { username, email }, approvalToken);
      console.log('✅ Owner approval request sent successfully');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError);
      // Delete the admin if owner email fails
      await adminModel.deleteOne({ _id: admin._id });
      return res.json({ 
        success: false, 
        message: "Failed to send approval request to owner. Please try again later."
      });
    }

    res.json({ 
      success: true, 
      message: "Registration request sent! Please wait for owner approval. You will receive an email once approved.",
      pendingApproval: true
    });
  } catch (error) {
    console.error('❌ Admin registration error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ success: false, message: error.message || "Admin registration failed" });
  }
};

// Verify admin email with PIN
const verifyAdminEmail = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    if (admin.isVerified) {
      return res.json({ success: false, message: "Email already verified. Please login." });
    }

    // Check if PIN matches
    if (admin.verificationPin !== pin) {
      return res.json({ success: false, message: "Invalid PIN. Please check and try again." });
    }

    // Check if PIN expired
    if (admin.verificationPinExpires < new Date()) {
      return res.json({ 
        success: false, 
        message: "PIN expired. Please request a new verification PIN.",
        expired: true
      });
    }

    // Verify admin
    admin.isVerified = true;
    admin.verificationPin = null;
    admin.verificationPinExpires = null;
    await admin.save();

    // Create token and log them in
    const token = createAdminToken(admin._id, admin.email);

    res.json({ 
      success: true, 
      message: "Email verified successfully! You can now login.",
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Resend admin verification PIN
const resendAdminVerificationPin = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Email not registered" });
    }

    if (admin.isVerified) {
      return res.json({ success: false, message: "Email already verified. Please login." });
    }

    // Generate new PIN
    const pin = generatePin();
    admin.verificationPin = pin;
    admin.verificationPinExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    // Send email
    await sendVerificationEmail(email, admin.username, pin);

    res.json({ 
      success: true, 
      message: "New verification PIN sent to your email"
    });
  } catch (error) {
    console.error('Admin resend verification error:', error);
    res.status(500).json({ success: false, message: "Failed to resend verification PIN" });
  }
};

// Request admin password reset (send PIN to email)
const requestAdminPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Email not registered. Please check your email or sign up." });
    }

    if (!admin.isApprovedByOwner) {
      return res.json({ 
        success: false, 
        message: "Your registration is pending owner approval. Please wait for confirmation.",
        pendingApproval: true
      });
    }

    if (!admin.isVerified) {
      return res.json({ 
        success: false, 
        message: "Please verify your email first before resetting password.",
        needsVerification: true
      });
    }

    // Generate reset PIN
    const pin = generatePin();
    admin.resetPin = pin;
    admin.resetPinExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await admin.save();

    // Send reset email
    await sendPasswordResetEmail(email, admin.username, pin);

    res.json({ 
      success: true, 
      message: "Password reset PIN sent to your email",
      email: email
    });
  } catch (error) {
    console.error('Admin password reset request error:', error);
    res.status(500).json({ success: false, message: "Failed to send password reset PIN" });
  }
};

// Verify admin reset PIN
const verifyAdminResetPin = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    // Check if PIN matches
    if (admin.resetPin !== pin) {
      return res.json({ success: false, message: "Invalid PIN" });
    }

    // Check if PIN expired
    if (admin.resetPinExpires < new Date()) {
      return res.json({ 
        success: false, 
        message: "PIN expired. Please request a new reset PIN.",
        expired: true
      });
    }

    res.json({ 
      success: true, 
      message: "PIN verified. You can now reset your password."
    });
  } catch (error) {
    console.error('Verify admin reset PIN error:', error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// Reset admin password with PIN
const resetAdminPassword = async (req, res) => {
  const { email, pin, newPassword } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    // Check if PIN matches
    if (admin.resetPin !== pin) {
      return res.json({ success: false, message: "Invalid PIN" });
    }

    // Check if PIN expired
    if (admin.resetPinExpires < new Date()) {
      return res.json({ 
        success: false, 
        message: "PIN expired. Please request a new reset PIN.",
        expired: true
      });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset PIN (old password is now invalid)
    admin.password = hashedPassword;
    admin.resetPin = null;
    admin.resetPinExpires = null;
    await admin.save();

    res.json({ 
      success: true, 
      message: "Password reset successful! You can now login with your new password."
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
};

// Owner approves admin registration
const approveAdmin = async (req, res) => {
  const { token } = req.params;

  try {
    const admin = await adminModel.findOne({ approvalToken: token });

    if (!admin) {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 50px; text-align: center; background: #121212; color: #F5F5F5;">
            <h1 style="color: #FF4C29;">❌ Invalid Request</h1>
            <p>This approval link is invalid or has already been used.</p>
          </body>
        </html>
      `);
    }

    if (admin.isApprovedByOwner) {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 50px; text-align: center; background: #121212; color: #F5F5F5;">
            <h1 style="color: #FFD369;">✅ Already Approved</h1>
            <p>This admin has already been approved.</p>
          </body>
        </html>
      `);
    }

    // Approve admin and generate verification PIN
    const pin = generatePin();
    admin.isApprovedByOwner = true;
    admin.approvalToken = null;
    admin.verificationPin = pin;
    admin.verificationPinExpires = new Date(Date.now() + 15 * 60 * 1000);
    await admin.save();

    // Send verification PIN to the new admin
    await sendAdminApprovedNotification(admin.email, admin.username, pin);

    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: linear-gradient(to bottom, #121212, #1A1A1A);
              color: #F5F5F5;
              padding: 50px;
              text-align: center;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              background: linear-gradient(to right, #10b981, #059669);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 20px;
            }
            .admin-info {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>Admin Approved Successfully!</h1>
            <p>You have approved the following admin:</p>
            <div class="admin-info">
              <p><strong>Username:</strong> ${admin.username}</p>
              <p><strong>Email:</strong> ${admin.email}</p>
            </div>
            <p style="color: #10b981;">A verification PIN has been sent to their email address.</p>
            <p style="color: #B3B3B3; font-size: 14px; margin-top: 30px;">You can close this window now.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Approve admin error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 50px; text-align: center; background: #121212; color: #F5F5F5;">
          <h1 style="color: #FF4C29;">❌ Error</h1>
          <p>Failed to approve admin. Please try again later.</p>
        </body>
      </html>
    `);
  }
};

// Owner rejects admin registration
const rejectAdmin = async (req, res) => {
  const { token } = req.params;

  try {
    const admin = await adminModel.findOne({ approvalToken: token });

    if (!admin) {
      return res.send(`
        <html>
          <body style="font-family: Arial; padding: 50px; text-align: center; background: #121212; color: #F5F5F5;">
            <h1 style="color: #FF4C29;">❌ Invalid Request</h1>
            <p>This rejection link is invalid or has already been used.</p>
          </body>
        </html>
      `);
    }

    // Delete the admin registration
    await adminModel.deleteOne({ _id: admin._id });

    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: 'Inter', Arial, sans-serif;
              background: linear-gradient(to bottom, #121212, #1A1A1A);
              color: #F5F5F5;
              padding: 50px;
              text-align: center;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
            }
            .reject-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              background: linear-gradient(to right, #ef4444, #dc2626);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              margin-bottom: 20px;
            }
            .admin-info {
              background: rgba(255, 255, 255, 0.03);
              border-radius: 12px;
              padding: 20px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="reject-icon">❌</div>
            <h1>Admin Registration Rejected</h1>
            <p>You have rejected the following admin registration:</p>
            <div class="admin-info">
              <p><strong>Username:</strong> ${admin.username}</p>
              <p><strong>Email:</strong> ${admin.email}</p>
            </div>
            <p style="color: #ef4444;">The registration has been deleted from the system.</p>
            <p style="color: #B3B3B3; font-size: 14px; margin-top: 30px;">You can close this window now.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Reject admin error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 50px; text-align: center; background: #121212; color: #F5F5F5;">
          <h1 style="color: #FF4C29;">❌ Error</h1>
          <p>Failed to reject admin. Please try again later.</p>
        </body>
      </html>
    `);
  }
};

export { 
  loginAdmin, 
  registerAdmin, 
  verifyAdminEmail, 
  resendAdminVerificationPin,
  requestAdminPasswordReset,
  verifyAdminResetPin,
  resetAdminPassword,
  approveAdmin,
  rejectAdmin
};

