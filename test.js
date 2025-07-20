require('dotenv').config();
const nodemailer = require('nodemailer');

async function testLogin() {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Login successful');
  } catch (error) {
    console.error('❌ Login failed:', error.message);
  }
}

testLogin();
