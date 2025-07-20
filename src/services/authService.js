const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

exports.generateTokenForEmail = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
};

exports.sendOtpEmail = async (email, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Your OTP is <strong>${otp}</strong></h2>
      <p>This code will expire in 5 minutes.</p>
    </div>
  `;

  await sendEmail(email, 'Your OTP for Library Login', html);
};
