const express = require('express');
const router = express.Router();
const Subscriber = require('../model/subs');
const sendEmail = require('../utils/emailSend'); 
const { google } = require('googleapis');

console.log("Contactus route loaded");


const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = process.env.GOOGLE_SHEET_ID;


const appendToSheet = async (range, values) => {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
};


router.post('/subscribe', async (req, res) => {
  console.log('Request received'); 

  const { email } = req.body;
  // console.log('Email:', email); 

  if (!email) {
    console.log('No email provided'); 
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const exists = await Subscriber.findOne({ email });
    console.log('DB Check:', exists); 

    if (exists) {
      return res.status(400).json({ error: 'Already subscribed' });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    // console.log('Saved to DB'); 

  let emailStatus = "Pending";

try {
  await sendEmail(
    email,
    'Thanks for subscribing!',
    `<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px 0;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
        
        <tr>
          <td bgcolor="#21467d" style="padding: 20px 30px; text-align: center;">
            <h2 style="color: #ffffff; font-size: 20px; margin: 10px 0 0;"> SANKALP SETU FOUNDATION </h2>
          </td>
        </tr>
        
        <tr>
          <td style="padding: 30px;">
            <h3 style="color: #21467d; font-size: 18px; margin-top: 0;">Thank you for subscribing!</h3>
            <p style="font-size: 15px; color: #333333; line-height: 1.5;">
              You’ve successfully subscribed to  SANKALP SETU FOUNDATION. You’ll now receive the latest news, updates, and offers straight to your inbox.
            </p>
            <p style="font-size: 15px; color: #333333; line-height: 1.5;">
              We're excited to have you on board and look forward to keeping you informed!
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding: 0 30px 30px 30px; text-align: center;">
            <a href="./" style="background-color: #21467d; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-size: 14px;">
              Visit Our Website
            </a>
          </td>
        </tr>

        <tr>
          <td bgcolor="#21467d" align="center" style="padding: 15px; color: #ffffff; font-size: 13px;">
            <p style="margin: 0;">© 2025 SANKALP SETU FOUNDATION. All rights reserved.</p>
            <p style="margin: 5px 0 0;">
              <a href="https://yourdomain.com/privacy-policy" style="color: #ffffff; text-decoration: underline;">Privacy Policy</a> | 
              <a href="https://yourdomain.com/terms" style="color: #ffffff; text-decoration: underline;">Terms & Conditions</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`
  );

  emailStatus = "Success";
  console.log('✅ Email sent');

} catch (emailErr) {
  emailStatus = `Failed: ${emailErr.message}`;
  console.error(' Email send failed:', emailErr.message);
}

await appendToSheet('SUBSCRIBE_EMAIL_NEWSLATTER!A1:C', [
  email.trim(),
  emailStatus,
  new Date().toLocaleString()
]);

    res.status(200).json({success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/send-newsletter', async (req, res) => {
  const { subject, message } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ error: 'Subject and message required' });
  }

  try {
    const subscribers = await Subscriber.find({});
    const emails = subscribers.map(sub => sub.email);

    if (emails.length === 0) {
      return res.status(400).json({ error: 'No subscribers found' });
    }

   
    await sendEmail(
      {
        to: process.env.EMAIL_USER,
        bcc: emails,                
      },
      subject,
      `<p>${message}</p>`
    );

    res.status(200).json({ success: true, message: 'Newsletter sent to all subscribers' });
  } catch (err) {
    console.error('Newsletter sending error:', err.message);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

router.get()

module.exports = router;
