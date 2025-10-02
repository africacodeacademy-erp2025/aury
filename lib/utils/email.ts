import nodemailer from 'nodemailer';
import { EmailParams } from '@/types';

// Create transporter (using Gmail as example, adjust for your email provider)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
  });
};

export async function sendEmail(params: EmailParams): Promise<{ success: boolean; message?: string }> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments || [],
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'Email sent successfully',
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    return {
      success: false,
      message: 'Failed to send email',
    };
  }
}

export async function sendPatternPurchaseEmail(
  customerEmail: string,
  customerName: string,
  patternName: string,
  pdfBuffer: Buffer
): Promise<{ success: boolean; message?: string }> {
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
            .content { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
                display: inline-block; 
                padding: 12px 24px; 
                background-color: #007bff; 
                color: white; 
                text-decoration: none; 
                border-radius: 5px; 
                margin: 20px 0; 
            }
            .footer { 
                border-top: 1px solid #eee; 
                padding-top: 20px; 
                margin-top: 30px; 
                text-align: center; 
                font-size: 14px; 
                color: #666; 
            }
        </style>
    </head>
    <body>
        <div class="content">
            <div class="header">
                <h1>🧶 Your Crochet Pattern is Ready!</h1>
            </div>
            
            <h2>Hi ${customerName}!</h2>
            
            <p>Thank you for purchasing <strong>${patternName}</strong> from our marketplace!</p>
            
            <p>Your professionally formatted crochet pattern is attached to this email as a PDF. The pattern includes:</p>
            
            <ul>
                <li>Complete materials list with yarn requirements</li>
                <li>Detailed gauge and tension information</li>
                <li>Step-by-step instructions with stitch counts</li>
                <li>Professional formatting and layout</li>
                <li>Tips and finishing techniques</li>
            </ul>
            
            <p>We hope you enjoy creating this beautiful project! If you have any questions about the pattern, feel free to reach out to us.</p>
            
            <p><strong>Happy Crocheting!</strong></p>
            
            <div class="footer">
                <p>© ${new Date().getFullYear()} Aury Marketplace. All rights reserved.</p>
                <p>This is an automated email. Please do not reply to this email address.</p>
            </div>
        </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Your Crochet Pattern: ${patternName}`,
    html: emailContent,
    attachments: [
      {
        filename: `${patternName.replace(/[^a-zA-Z0-9]/g, '_')}_Pattern.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}