import nodemailer from 'nodemailer';
import logger from './logger.mjs';

// Create transporter (for development, we'll use a test account)
// In production, configure with your actual SMTP settings
const createTransporter = () => {
  // For development, we'll use Ethereal Email (fake SMTP for testing)
  // In production, replace with your actual SMTP configuration
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development mode - use Ethereal Email for testing
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetUrl, username, resetPin = null) => {
  try {
    // For development, try to send real email or return mock response
    if (process.env.NODE_ENV !== 'production') {
      // Try to use Gmail SMTP if configured, otherwise use mock
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        logger.info('Development mode: using Gmail SMTP');
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
          },
        });
        
        const mailOptions = {
          from: process.env.GMAIL_USER,
          to: email,
          subject: '🔒 Razewire Enterprise - Password Reset Required',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <title>Password Reset - Razewire Enterprise</title>
              <style>
                /* Reset styles */
                body, table, td, p, a, li, blockquote {
                  -webkit-text-size-adjust: 100%;
                  -ms-text-size-adjust: 100%;
                }
                table, td {
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                }
                img {
                  -ms-interpolation-mode: bicubic;
                  border: 0;
                  height: auto;
                  line-height: 100%;
                  outline: none;
                  text-decoration: none;
                }
                
                /* Main styles */
                body {
                  height: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  width: 100% !important;
                  background-color: #f4f6f8;
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                
                .email-container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .header {
                  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1d4ed8 100%);
                  padding: 40px 30px;
                  text-align: center;
                  position: relative;
                }
                
                .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
                  opacity: 0.3;
                }
                
                .logo {
                  color: #ffffff;
                  font-size: 32px;
                  font-weight: 700;
                  margin: 0;
                  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  position: relative;
                  z-index: 1;
                }
                
                .header-subtitle {
                  color: #e2e8f0;
                  font-size: 16px;
                  margin: 8px 0 0 0;
                  font-weight: 400;
                  position: relative;
                  z-index: 1;
                }
                
                .content {
                  padding: 40px 30px;
                  background-color: #ffffff;
                }
                
                .greeting {
                  font-size: 24px;
                  font-weight: 600;
                  color: #1e293b;
                  margin: 0 0 20px 0;
                  line-height: 1.3;
                }
                
                .message {
                  font-size: 16px;
                  line-height: 1.6;
                  color: #475569;
                  margin: 0 0 30px 0;
                }
                
                .button-container {
                  text-align: center;
                  margin: 30px 0;
                }
                
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                  color: #ffffff !important;
                  padding: 16px 32px;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 600;
                  font-size: 16px;
                  text-align: center;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                  transition: all 0.3s ease;
                  border: none;
                  cursor: pointer;
                }
                
                .button:hover {
                  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
                  transform: translateY(-2px);
                }
                
                .link-container {
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 30px 0;
                }
                
                .link-label {
                  font-size: 14px;
                  font-weight: 600;
                  color: #64748b;
                  margin: 0 0 10px 0;
                }
                
                .link-text {
                  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
                  font-size: 12px;
                  color: #3b82f6;
                  word-break: break-all;
                  line-height: 1.4;
                  margin: 0;
                }
                
                .security-notice {
                  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                  border-left: 4px solid #f59e0b;
                  border-radius: 0 8px 8px 0;
                  padding: 20px;
                  margin: 30px 0;
                }
                
                .security-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #92400e;
                  margin: 0 0 10px 0;
                  display: flex;
                  align-items: center;
                }
                
                .security-icon {
                  margin-right: 8px;
                  font-size: 18px;
                }
                
                .security-text {
                  font-size: 14px;
                  color: #92400e;
                  margin: 0;
                  line-height: 1.5;
                }
                
                .footer {
                  background-color: #f8fafc;
                  padding: 30px;
                  border-top: 1px solid #e2e8f0;
                }
                
                .footer-content {
                  text-align: center;
                }
                
                .footer-text {
                  font-size: 14px;
                  color: #64748b;
                  margin: 0 0 10px 0;
                  line-height: 1.5;
                }
                
                .footer-links {
                  margin: 20px 0;
                }
                
                .footer-link {
                  color: #3b82f6;
                  text-decoration: none;
                  font-size: 14px;
                  margin: 0 15px;
                }
                
                .footer-link:hover {
                  text-decoration: underline;
                }
                
                .copyright {
                  font-size: 12px;
                  color: #94a3b8;
                  margin: 20px 0 0 0;
                }
                
                .divider {
                  height: 1px;
                  background: linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%);
                  margin: 20px 0;
                }
                
                /* Responsive */
                @media only screen and (max-width: 600px) {
                  .email-container {
                    margin: 0;
                    border-radius: 0;
                  }
                  
                  .header, .content, .footer {
                    padding: 20px;
                  }
                  
                  .logo {
                    font-size: 28px;
                  }
                  
                  .greeting {
                    font-size: 20px;
                  }
                  
                  .button {
                    padding: 14px 28px;
                    font-size: 15px;
                  }
                }
              </style>
            </head>
            <body>
              <div style="background-color: #f4f6f8; padding: 20px 0;">
                <div class="email-container">
                  <!-- Header -->
                  <div class="header">
                    <h1 class="logo">Razewire</h1>
                    <p class="header-subtitle">Enterprise Security Portal</p>
                  </div>
                  
                  <!-- Content -->
                  <div class="content">
                    <h2 class="greeting">Hello ${username || 'Valued User'},</h2>
                    
                    <p class="message">
                      We received a request to reset the password for your Razewire Enterprise account. 
                      This is a secure, time-sensitive operation that requires immediate attention.
                    </p>
                    
                    ${resetPin ? `
                    <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0ea5e9; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                      <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Your Password Reset PIN</h3>
                      <div style="background: #ffffff; border: 2px dashed #0ea5e9; border-radius: 8px; padding: 20px; margin: 15px 0;">
                        <span style="font-size: 36px; font-weight: 700; color: #0c4a6e; letter-spacing: 8px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;">${resetPin}</span>
                      </div>
                      <p style="color: #0c4a6e; margin: 15px 0 0 0; font-size: 14px; font-weight: 500;">Enter this PIN on the password reset page</p>
                    </div>
                    ` : ''}
                    
                    <p class="message">
                      If you initiated this password reset request, please use the PIN above to proceed 
                      with setting up your new password. This action will help secure your account and 
                      maintain access to our enterprise services.
                    </p>
                    
                    <div class="button-container">
                      <a href="${resetUrl}" class="button">Go to Password Reset Page</a>
                    </div>
                    
                    <div class="link-container">
                      <p class="link-label">Direct Access URL:</p>
                      <p class="link-text">${resetUrl}</p>
                    </div>
                    
                    <div class="security-notice">
                      <h3 class="security-title">
                        <span class="security-icon">🔒</span>
                        Security Notice
                      </h3>
                      <p class="security-text">
                        <strong>Time-Sensitive:</strong> This reset PIN will expire in 5 minutes for your security.<br>
                        <strong>Unauthorized Access:</strong> If you did not request this password reset, please ignore this email and contact our security team immediately.<br>
                        <strong>Account Protection:</strong> Never share your password, PIN, or reset links with anyone.
                      </p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <p class="message">
                      For additional security questions or if you need assistance, please contact our 
                      Enterprise Support Team. We're here to help ensure your account remains secure.
                    </p>
                  </div>
                  
                  <!-- Footer -->
                  <div class="footer">
                    <div class="footer-content">
                      <p class="footer-text">
                        This email was sent from Razewire Enterprise Security System.<br>
                        Please do not reply to this automated message.
                      </p>
                      
                      <div class="footer-links">
                        <a href="#" class="footer-link">Security Center</a>
                        <a href="#" class="footer-link">Support Portal</a>
                        <a href="#" class="footer-link">Privacy Policy</a>
                      </div>
                      
                      <p class="copyright">
                        &copy; ${new Date().getFullYear()} Razewire Enterprise. All rights reserved.<br>
                        This message is confidential and intended only for the recipient.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
            RAZEWIRE ENTERPRISE - PASSWORD RESET REQUEST
            
            Hello ${username || 'Valued User'},
            
            We received a request to reset the password for your Razewire Enterprise account. 
            This is a secure, time-sensitive operation that requires immediate attention.
            
            ${resetPin ? `
            YOUR PASSWORD RESET PIN:
            ╔══════════════════════════════════════╗
            ║              ${resetPin}              ║
            ╚══════════════════════════════════════╝
            
            Enter this PIN on the password reset page: ${resetUrl}
            ` : `
            If you initiated this password reset request, please use the link below to proceed 
            with setting up your new password:
            
            ${resetUrl}
            `}
            
            SECURITY NOTICE:
            - This reset PIN will expire in 5 minutes for your security
            - If you did not request this password reset, please ignore this email and contact our security team immediately
            - Never share your password, PIN, or reset links with anyone
            
            For additional security questions or assistance, please contact our Enterprise Support Team.
            
            This email was sent from Razewire Enterprise Security System.
            Please do not reply to this automated message.
            
            © ${new Date().getFullYear()} Razewire Enterprise. All rights reserved.
            This message is confidential and intended only for the recipient.
          `,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info('📧 Password reset email sent successfully to:', email);
        logger.info('Message ID:', info.messageId);
        
        return {
          success: true,
          messageId: info.messageId,
          previewUrl: null
        };
      } else {
        logger.info('Development mode: Gmail not configured, returning mock response');
        logger.info('Reset URL would be:', resetUrl);
        return {
          success: true,
          messageId: 'mock-message-id',
          previewUrl: null
        };
      }
    }

    const transporter = createTransporter();

    // For production, validate SMTP configuration
    if (process.env.NODE_ENV === 'production') {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.error('SMTP configuration missing for production');
        throw new Error('Email service not configured');
      }
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@razewire.com',
      to: email,
      subject: 'Password Reset Request - Razewire',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - Razewire</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background: #2563eb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #64748b;
            }
            .warning {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              color: #92400e;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Razewire</h1>
            <p>Password Reset Request</p>
          </div>
          
          <div class="content">
            <h2>Hello ${username || 'User'}!</h2>
            
            <p>We received a request to reset your password for your Razewire account. If you made this request, click the button below to reset your password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e2e8f0; padding: 10px; border-radius: 4px; font-family: monospace;">
              ${resetUrl}
            </p>
            
            <div class="warning">
              <strong>Security Notice:</strong> This link will expire in 10 minutes for your security. If you didn't request this password reset, please ignore this email.
            </div>
            
            <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
            
            <div class="footer">
              <p>This email was sent from Razewire. If you have any questions, please contact our support team.</p>
              <p>&copy; ${new Date().getFullYear()} Razewire. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Razewire
        
        Hello ${username || 'User'}!
        
        We received a request to reset your password for your Razewire account. If you made this request, click the link below to reset your password:
        
        ${resetUrl}
        
        This link will expire in 10 minutes for your security. If you didn't request this password reset, please ignore this email.
        
        If you're having trouble with the link above, copy and paste the URL into your web browser.
        
        This email was sent from Razewire. If you have any questions, please contact our support team.
        
        © ${new Date().getFullYear()} Razewire. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info('📧 Password reset email sent (development mode):');
      logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    } else {
      logger.info('📧 Password reset email sent to:', email);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null,
    };
  } catch (error) {
    logger.error('❌ Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send welcome email (for future use)
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();

    // For development, we'll create a test account
    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await nodemailer.createTestAccount();
      transporter.set('auth', {
        user: testAccount.user,
        pass: testAccount.pass,
      });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@razewire.com',
      to: email,
      subject: 'Welcome to Razewire!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome - Razewire</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: #f8fafc;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              background: #3b82f6;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 20px 0;
            }
            .button:hover {
              background: #2563eb;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Razewire</h1>
            <p>Welcome to the future of news!</p>
          </div>
          
          <div class="content">
            <h2>Welcome, ${username}!</h2>
            
            <p>Thank you for joining Razewire! We're excited to have you as part of our community.</p>
            
            <p>With Razewire, you'll get:</p>
            <ul>
              <li>Real-time news updates</li>
              <li>Personalized content recommendations</li>
              <li>Multi-language support</li>
              <li>Mobile-optimized experience</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Start Exploring</a>
            </div>
            
            <div class="footer">
              <p>If you have any questions, feel free to reach out to our support team.</p>
              <p>&copy; ${new Date().getFullYear()} Razewire. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info('📧 Welcome email sent (development mode):');
      logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(info));
    } else {
      logger.info('📧 Welcome email sent to:', email);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null,
    };
  } catch (error) {
    logger.error('❌ Failed to send welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};
