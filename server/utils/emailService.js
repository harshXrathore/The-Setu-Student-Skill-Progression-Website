const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Note: Since no real SMTP credentials are provided by the user,
    // we use ethereal email (a fake SMTP service provided by nodemailer for testing)
    // or simply log to the console to simulate sending the email securely.
    
    // Create a testing account on the fly if credentials aren't set in ENV
    let transporter;
    
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
        // Real SMTP configuration
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    } else {
        // Fallback for local development: Create a test account
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

    const message = {
        from: `${process.env.FROM_NAME || 'Support Team'} <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    
    if (!process.env.SMTP_HOST) {
        // If using test account, log the URL where the fake email can be viewed
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
