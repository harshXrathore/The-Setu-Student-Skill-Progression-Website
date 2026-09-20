const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = async () => {
    // In test environment, bypass caching to allow Jest mocks to work cleanly
    if (process.env.NODE_ENV !== 'test' && cachedTransporter) {
        return cachedTransporter;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const cleanPassword = process.env.SMTP_PASSWORD.replace(/\s+/g, '');
        const host = process.env.SMTP_HOST.trim();
        const isGmail = host.includes('gmail');
        
        // For Gmail on cloud platforms (Render/Vercel/AWS), Port 465 with SSL (secure: true) 
        // combined with family: 4 (IPv4) is the most reliable transport to prevent IPv6 timeouts.
        const port = Number(process.env.SMTP_PORT) || (isGmail ? 465 : 587);
        const isSecure = port === 465;

        const transporter = nodemailer.createTransport({
            host: isGmail ? 'smtp.gmail.com' : host,
            port: port,
            secure: isSecure,
            requireTLS: !isSecure,
            auth: {
                user: process.env.SMTP_USER.trim(),
                pass: cleanPassword,
            },
            family: 4, // CRITICAL: Force IPv4 DNS lookup to prevent IPv6 connection timeouts on cloud hosts like Render
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            connectionTimeout: 15000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            tls: {
                rejectUnauthorized: false
            }
        });

        if (process.env.NODE_ENV !== 'test') {
            cachedTransporter = transporter;
        }
        return transporter;
    } else {
        console.warn('⚠️ [SMTP WARNING] SMTP environment variables (SMTP_HOST, SMTP_USER, SMTP_PASSWORD) are NOT configured in environment! Falling back to Ethereal Email test account.');
        const testAccount = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            family: 4,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
            connectionTimeout: 15000,
        });

        if (process.env.NODE_ENV !== 'test') {
            cachedTransporter = transporter;
        }
        return transporter;
    }
};

const sendEmail = async (options) => {
    const transporter = await getTransporter();

    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
    const fromName = process.env.FROM_NAME || 'The-Setu Platform';

    // Rich HTML Template for OTP / Notifications
    const htmlMessage = options.html || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4F46E5; margin: 0;">🎓 ${fromName}</h1>
          <p style="color: #6B7280; font-size: 14px;">Student Skill Progression & Career Roadmap</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <div style="padding: 10px 0;">
          <h2 style="color: #111827; font-size: 18px;">${options.subject}</h2>
          <p style="color: #374151; font-size: 15px; line-height: 1.6;">${options.message.replace(/\n/g, '<br/>')}</p>
        </div>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="color: #9CA3AF; font-size: 12px; text-align: center;">
          If you did not request this email, please ignore it.<br/>
          &copy; ${new Date().getFullYear()} ${fromName}. All rights reserved.
        </p>
      </div>
    `;

    const message = {
        from: `"${fromName}" <${fromAddress}>`,
        replyTo: fromAddress,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: htmlMessage,
    };

    const info = await transporter.sendMail(message);

    console.log('📧 Message sent successfully to %s (ID: %s)', options.email, info.messageId);
    
    if (!process.env.SMTP_HOST) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
