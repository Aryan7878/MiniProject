import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends a price drop alert email to the user.
 * 
 * @param {string} to - Recipient email
 * @param {Object} data - Product and price data
 */
export const sendPriceAlert = async (to, data) => {
    const { productName, targetPrice, currentPrice, productUrl, productImage } = data;

    const mailOptions = {
        from: `"SmartCart Alerts" <${process.env.EMAIL_USER}>`,
        to,
        subject: `📉 PRICE DROP ALERT: ${productName} hit your target!`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; padding: 20px;">
                <h2 style="color: #4f46e5;">Your target price has been reached!</h2>
                <p>Great news! <strong>${productName}</strong> is now available for <strong>₹${currentPrice.toLocaleString()}</strong>, which is below your target of ₹${targetPrice.toLocaleString()}.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <img src="${productImage}" alt="${productName}" style="max-width: 200px; border-radius: 10px;">
                </div>

                <div style="background: #f9fafb; padding: 20px; border-radius: 10px; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Current Best Price</p>
                    <p style="margin: 5px 0 20px 0; font-size: 32px; font-weight: bold; color: #111827;">₹${currentPrice.toLocaleString()}</p>
                    <a href="${productUrl}" style="background: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Buy Now</a>
                </div>

                <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">You received this because you set a price alert on SmartCart. Happy shopping!</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Price alert email sent to ${to} for ${productName}`);
    } catch (error) {
        console.error("❌ Email Error:", error.message);
    }
};
