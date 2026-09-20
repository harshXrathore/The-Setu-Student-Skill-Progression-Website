const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = async () => {
    // In test environment, bypass caching to allow Jest mocks to work cleanly
    if (process.env.NODE_ENV !== 'test' && cachedTransporter) {
        return cachedTransporter;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const isGmail = process.env.SMTP_HOST.includes('gmail');
        const cleanPassword = process.env.SMTP_PASSWORD.replace(/\s+/g, '');
        
        const transporter = nodemailer.createTransport(
            isGmail ? {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER.trim(),
                    pass: cleanPassword,
                },
                pool: true,
                maxConnections: 5,
                maxMessages: 100,
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            } : {
                host: process.env.SMTP_HOST.trim(),
                port: Number(process.env.SMTP_PORT) || 587,
                secure: Number(process.env.SMTP_PORT) === 465,
                auth: {
                    user: process.env.SMTP_USER.trim(),
                    pass: cleanPassword,
                },
                pool: true,
                tls: {
                    rejectUnauthorized: false
                },
                connectionTimeout: 10000,
                greetingTimeout: 5000,
                socketTimeout: 15000,
            }
        );

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
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
            connectionTimeout: 10000,
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
