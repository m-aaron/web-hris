import { Resend } from 'resend';
import dotenv from 'dotenv';


dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Send email via Resend sandbox
export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        // Send email
        const info = await resend.emails.send({
        from: `"HRIS System" <${process.env.EMAIL_FROM}>`, // sandbox sender
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ''),
        });

        console.log('Email sent (sandbox):', info);
    } catch (err) {
        console.error('Failed to send email:', err);
    }
};
