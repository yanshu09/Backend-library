
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,   // your Gmail address
        pass: process.env.EMAIL_PASS    // your App Password
      }
    });

    const mailOptions = {
      from: `"Library Tracker Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${to}`);
  } catch (err) {
    console.error(' Failed to send email:', err.message);
  }
};

module.exports = sendEmail;
