import pkg from 'nodemailer';
const nodemailer = pkg.default || pkg;

// Create email transporter
const createTransporter = () => {
  // For development: Use Gmail or any SMTP service
  // For production: Use services like SendGrid, AWS SES, etc.
  
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Generate a 6-digit PIN
 */
export const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification email with PIN
 */
export const sendVerificationEmail = async (email, username, pin) => {
  try {
    console.log('📧 Attempting to send verification email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', email);
    console.log('Password set:', !!process.env.EMAIL_PASSWORD);
    
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Trio Order" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔐 Verify Your Email - Trio Order',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Lato', sans-serif;
              background: linear-gradient(to bottom, #121212, #1A1A1A);
              color: #F5F5F5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
              backdrop-filter: blur(10px);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(to right, #FF4C29, #FFD369);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-family: 'Playfair Display', serif;
            }
            .pin-box {
              background: linear-gradient(135deg, #FF4C29, #FFD369);
              color: #121212;
              font-size: 36px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 16px;
              margin: 30px 0;
              letter-spacing: 8px;
            }
            .message {
              color: #B3B3B3;
              line-height: 1.8;
              margin: 20px 0;
            }
            .warning {
              background: rgba(255, 76, 41, 0.1);
              border-left: 4px solid #FF4C29;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              color: #FFD369;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍕 Trio Order</div>
              <h2 style="color: #F5F5F5; margin-top: 10px;">Welcome, ${username}!</h2>
            </div>
            
            <p class="message">
              Thank you for signing up! To complete your registration and secure your account, 
              please verify your email address using the PIN below:
            </p>
            
            <div class="pin-box">${pin}</div>
            
            <p class="message">
              Enter this PIN in the verification page to activate your account.
            </p>
            
            <div class="warning">
              ⏰ <strong>Important:</strong> This PIN will expire in 15 minutes. 
              If you didn't request this, please ignore this email.
            </div>
            
            <p class="message">
              If you have any questions, feel free to contact our support team.
            </p>
            
            <div class="footer">
              <p>© 2025 Trio Order. All rights reserved.</p>
              <p>Delivering delicious moments to your doorstep 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send password reset email with PIN
 */
/**
 * Send owner approval request email for new admin signup
 */
export const sendOwnerApprovalRequest = async (ownerEmail, newAdminData, approvalToken) => {
  try {
    console.log('📧 Sending owner approval request...');
    console.log('To:', ownerEmail);
    console.log('New Admin:', newAdminData.email);
    
    const transporter = createTransporter();
    const approvalLink = `http://localhost:4000/api/admin/approve/${approvalToken}`;
    const rejectLink = `http://localhost:4000/api/admin/reject/${approvalToken}`;

    const mailOptions = {
      from: `"Trio Order Admin System" <${process.env.EMAIL_USER}>`,
      to: ownerEmail,
      subject: '🔔 New Admin Registration Request - Action Required',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Lato', sans-serif;
              background: linear-gradient(to bottom, #121212, #1A1A1A);
              color: #F5F5F5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
              backdrop-filter: blur(10px);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(to right, #FF4C29, #FFD369);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-family: 'Playfair Display', serif;
            }
            .admin-info {
              background: rgba(255, 255, 255, 0.03);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 16px;
              padding: 20px;
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .info-label {
              color: #B3B3B3;
              font-weight: 500;
            }
            .info-value {
              color: #FFD369;
              font-weight: 600;
            }
            .button-container {
              display: flex;
              gap: 15px;
              margin: 30px 0;
            }
            .button {
              flex: 1;
              text-align: center;
              padding: 15px 30px;
              border-radius: 12px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              display: inline-block;
            }
            .approve-btn {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
            }
            .reject-btn {
              background: linear-gradient(135deg, #ef4444, #dc2626);
              color: white;
            }
            .warning {
              background: rgba(255, 76, 41, 0.1);
              border-left: 4px solid #FF4C29;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              color: #FFD369;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍕 Trio Order</div>
              <h2 style="color: #F5F5F5; margin-top: 10px;">New Admin Registration</h2>
            </div>
            
            <p style="color: #B3B3B3; line-height: 1.8;">
              Hello Owner,
            </p>
            
            <p style="color: #B3B3B3; line-height: 1.8;">
              A new administrator has requested access to the Trio Order admin panel. 
              Please review their details below:
            </p>
            
            <div class="admin-info">
              <div class="info-row">
                <span class="info-label">Username:</span>
                <span class="info-value">${newAdminData.username}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${newAdminData.email}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Registration Date:</span>
                <span class="info-value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            
            <p style="color: #B3B3B3; line-height: 1.8;">
              <strong style="color: #FFD369;">Action Required:</strong> Please approve or reject this registration request.
            </p>
            
            <div class="button-container">
              <a href="${approvalLink}" class="button approve-btn">
                ✅ Approve Admin
              </a>
              <a href="${rejectLink}" class="button reject-btn">
                ❌ Reject Request
              </a>
            </div>
            
            <div class="warning">
              🔒 <strong>Security Note:</strong> Once approved, the new admin will receive a verification PIN 
              to complete their registration. They will have full access to manage orders, items, and other admin functions.
            </div>
            
            <div class="footer">
              <p>© 2025 Trio Order Admin System. All rights reserved.</p>
              <p>This is an automated security notification.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Owner approval request sent to ${ownerEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending owner approval request:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    throw new Error(`Failed to send owner approval request: ${error.message}`);
  }
};

/**
 * Send notification to new admin after owner approval
 */
export const sendAdminApprovedNotification = async (email, username, pin) => {
  try {
    console.log('📧 Sending admin approval notification...');
    
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Trio Order" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '✅ Admin Account Approved - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Lato', sans-serif;
              background: linear-gradient(to bottom, #121212, #1A1A1A);
              color: #F5F5F5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
              backdrop-filter: blur(10px);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(to right, #FF4C29, #FFD369);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-family: 'Playfair Display', serif;
            }
            .pin-box {
              background: linear-gradient(135deg, #FF4C29, #FFD369);
              color: #121212;
              font-size: 36px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 16px;
              margin: 30px 0;
              letter-spacing: 8px;
            }
            .success-badge {
              background: linear-gradient(135deg, #10b981, #059669);
              color: white;
              padding: 10px 20px;
              border-radius: 8px;
              display: inline-block;
              margin: 20px 0;
            }
            .message {
              color: #B3B3B3;
              line-height: 1.8;
              margin: 20px 0;
            }
            .warning {
              background: rgba(16, 185, 129, 0.1);
              border-left: 4px solid #10b981;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              color: #FFD369;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍕 Trio Order</div>
              <h2 style="color: #F5F5F5; margin-top: 10px;">Congratulations, ${username}!</h2>
            </div>
            
            <div style="text-align: center;">
              <div class="success-badge">
                ✅ Your admin account has been approved!
              </div>
            </div>
            
            <p class="message">
              The system owner has approved your administrator registration. 
              Please verify your email address using the PIN below to complete your account setup:
            </p>
            
            <div class="pin-box">${pin}</div>
            
            <p class="message">
              Enter this PIN on the verification page to activate your admin account and start managing the Trio Order platform.
            </p>
            
            <div class="warning">
              ⏰ <strong>Important:</strong> This PIN will expire in 15 minutes. 
              Please complete the verification process promptly.
            </div>
            
            <p class="message">
              Welcome to the Trio Order admin team! 🎉
            </p>
            
            <div class="footer">
              <p>© 2025 Trio Order. All rights reserved.</p>
              <p>Delivering delicious moments to your doorstep 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin approval notification sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin approval notification:', error.message);
    throw new Error(`Failed to send admin approval notification: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, username, pin) => {
  try {
    console.log('🔑 Attempting to send password reset email...');
    console.log('From:', process.env.EMAIL_USER);
    console.log('To:', email);
    
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Trio Order" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '🔑 Reset Your Password - Trio Order',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Inter', 'Lato', sans-serif;
              background: linear-gradient(to bottom, #121212, #1A1A1A);
              color: #F5F5F5;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 24px;
              padding: 40px;
              backdrop-filter: blur(10px);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              background: linear-gradient(to right, #FF4C29, #FFD369);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              font-family: 'Playfair Display', serif;
            }
            .pin-box {
              background: linear-gradient(135deg, #FF4C29, #FFD369);
              color: #121212;
              font-size: 36px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 16px;
              margin: 30px 0;
              letter-spacing: 8px;
            }
            .message {
              color: #B3B3B3;
              line-height: 1.8;
              margin: 20px 0;
            }
            .warning {
              background: rgba(255, 76, 41, 0.1);
              border-left: 4px solid #FF4C29;
              padding: 15px;
              margin: 20px 0;
              border-radius: 8px;
              color: #FFD369;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🍕 Trio Order</div>
              <h2 style="color: #F5F5F5; margin-top: 10px;">Password Reset Request</h2>
            </div>
            
            <p class="message">
              Hi ${username},
            </p>
            
            <p class="message">
              We received a request to reset your password. Use the PIN below to proceed:
            </p>
            
            <div class="pin-box">${pin}</div>
            
            <p class="message">
              Enter this PIN on the password reset page to create a new password.
            </p>
            
            <div class="warning">
              ⏰ <strong>Important:</strong> This PIN will expire in 15 minutes.<br>
              🔒 If you didn't request this, your account is still secure. Simply ignore this email.
            </div>
            
            <p class="message">
              For security reasons, your old password will be invalidated once you reset it.
            </p>
            
            <div class="footer">
              <p>© 2025 Trio Order. All rights reserved.</p>
              <p>Delivering delicious moments to your doorstep 🚀</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

