import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEmail() {
  try {
    console.log('🧪 Testing email configuration...');
    
    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.log('❌ Gmail credentials not found in .env file');
      console.log('📝 Please add the following to your .env file:');
      console.log('GMAIL_USER=your_email@gmail.com');
      console.log('GMAIL_APP_PASSWORD=your_16_character_app_password');
      return;
    }
    
    console.log('✅ Gmail credentials found');
    console.log('📧 From:', process.env.GMAIL_USER);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    
    // Test email
    const testEmail = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Send to yourself for testing
      subject: 'Razewire Email Test',
      html: `
        <h1>Email Test Successful!</h1>
        <p>If you receive this email, your Gmail SMTP configuration is working correctly.</p>
        <p>You can now use the forgot password feature.</p>
      `,
      text: 'Email Test Successful! If you receive this email, your Gmail SMTP configuration is working correctly.'
    };
    
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail(testEmail);
    
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Check your inbox for the test email');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.message.includes('Invalid login')) {
      console.log('💡 Solution: Check your Gmail app password');
    } else if (error.message.includes('Connection timeout')) {
      console.log('💡 Solution: Check your internet connection');
    } else {
      console.log('💡 Solution: Check your .env file configuration');
    }
  }
}

testEmail();
