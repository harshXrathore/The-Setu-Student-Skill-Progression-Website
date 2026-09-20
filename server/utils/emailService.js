const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}
const nodemailer = require('nodemailer');

let cachedTransporter = null;

const getTransporter = async () => {
    if (process.env.NODE_ENV !== 'test' && cachedTransporter) {
        return cachedTransporter;
    }

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        const cleanPassword = process.env.SMTP_PASSWORD.replace(/\s+/g, '');
        const host = process.env.SMTP_HOST.trim();
        const isGmail = host.includes('gmail');
        
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
            family: 4, // Force IPv4 DNS lookup
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            connectionTimeout: 8000, // Fail fast (8s) if host blocks SMTP port
            greetingTimeout: 5000,
            socketTimeout: 10000,
            tls: {
                rejectUnauthorized: false
            }
        });

        if (process.env.NODE_ENV !== 'test') {
            cachedTransporter = transporter;
        }
        return transporter;
    }
    return null;
};

// Send via Resend HTTP API (Port 443 - 100% reliable on Render/cloud hosts)
const sendViaResend = async (options, fromName, fromAddress, htmlMessage) => {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: `${fromName} <onboarding@resend.dev>`,
            to: [options.email],
            subject: options.subject,
            text: options.message,
            html: htmlMessage
        })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || JSON.stringify(data));
    }
    console.log('📧 Email sent successfully via Resend API to %s (ID: %s)', options.email, data.id);
    return data;
};

// Send via Brevo HTTP API (Port 443 - 100% reliable on Render/cloud hosts)
const sendViaBrevo = async (options, fromName, fromAddress, htmlMessage) => {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            sender: { name: fromName, email: fromAddress },
            to: [{ email: options.email }],
            subject: options.subject,
            textContent: options.message,
            htmlContent: htmlMessage
        })
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || JSON.stringify(data));
    }
    console.log('📧 Email sent successfully via Brevo API to %s (ID: %s)', options.email, data.messageId);
    return data;
};

const sendEmail = async (options) => {
    const fromAddress = process.env.FROM_EMAIL || process.env.SMTP_USER || 'noreply@example.com';
    const fromName = process.env.FROM_NAME || 'The-Setu Platform';

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

    // 1. Try Direct SMTP Transporter (Gmail) first with IPv4 DNS resolution
    const transporter = await getTransporter();
    if (transporter) {
        try {
            const message = {
                from: `"${fromName}" <${fromAddress}>`,
                replyTo: fromAddress,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: htmlMessage,
            };

            const info = await transporter.sendMail(message);
            console.log('📧 Message sent successfully via SMTP to %s (ID: %s)', options.email, info.messageId);
            return info;
        } catch (smtpErr) {
            console.error('⚠️ SMTP connection error:', smtpErr.message);
        }
    }

    // 2. Try Resend HTTPS API if key present
    if (process.env.RESEND_API_KEY) {
        try {
            return await sendViaResend(options, fromName, fromAddress, htmlMessage);
        } catch (err) {
            console.error('⚠️ Resend API error:', err.message);
        }
    }

    // 3. Try Brevo HTTPS API if key present
    if (process.env.BREVO_API_KEY) {
        try {
            return await sendViaBrevo(options, fromName, fromAddress, htmlMessage);
        } catch (err) {
            console.error('⚠️ Brevo API error:', err.message);
        }
    }

    // 4. Fallback to Ethereal
    const testAccount = await nodemailer.createTestAccount();
    const ethTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        family: 4,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
        connectionTimeout: 10000,
    });

    const info = await ethTransporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: htmlMessage,
    });
    console.log('📧 Sent via Ethereal test account to %s. Preview URL: %s', options.email, nodemailer.getTestMessageUrl(info));
    return info;
};

module.exports = sendEmail;
