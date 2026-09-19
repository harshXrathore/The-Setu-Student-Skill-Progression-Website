const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transporter;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const isGmail = process.env.SMTP_HOST.includes('gmail');
        
        transporter = nodemailer.createTransport(
            isGmail ? {
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            } : {
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD,
                },
            }
        );
    } else {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

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
