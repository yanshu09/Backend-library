const express = require('express');
const router = express.Router();
const Otp = require('../models/Otp');
const User = require('../models/User');
const authService = require('../services/authService');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Send OTP to email
router.post('/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const code = generateOtp();
    console.log('Generated OTP:', code);

    await Otp.deleteMany({ email }); // remove old OTPs
    const otpDoc = await Otp.create({ email, code });
    console.log('✅ OTP saved:', otpDoc);

    await authService.sendOtpEmail(email, code);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ✅ Verify OTP — supports both login & registration
router.post('/verify-otp', async (req, res) => {
  const { email, code, forRegistration } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and OTP code are required' });
  }

  try {
    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }

    if (record.code !== code.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await Otp.deleteMany({ email });

    if (forRegistration) {
      // ✅ Only verify OTP, user will register later
      return res.status(200).json({ message: 'OTP verified successfully' });
    }

    // ✅ Login flow — generate token
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = authService.generateTokenForEmail(user._id);

    res.status(200).json({
      message: 'OTP verified',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
