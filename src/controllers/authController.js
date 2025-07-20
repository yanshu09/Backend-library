const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const Otp = require('../models/Otp');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '7d',
  });

//                             -------------------------
//                               Register a new user
//                             -------------------------
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const profilePicture = req.file ? `uploads/${req.file.filename}` : '';
    const user = new User({ username, email: email.toLowerCase(), password, profilePicture });
    await user.save();

    await sendEmail(
      email,
      'Welcome to Personal Library Tracker',
      `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Hi ${username},</h2>
          <p>Welcome to your <strong>Personal Library Tracker</strong>! We're excited to have you on board 🎉</p>

          <p>📚 Start managing your books today with ease and clarity.</p>

          <p>
            <a href="http://localhost:5173" target="_blank"
              style="display: inline-block; padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">
              Go to your Dashboard
            </a>
          </p>

          <p>Thanks for joining us!<br/>~ Team Library Tracker</p>

          <p>This platform was created by 
            <a href="https://www.linkedin.com/in/yanshu-agarwal09/" target="_blank" style="color: #1976d2; text-decoration: none;">
              <strong>Yanshu Agarwal</strong>
            </a>.
          </p>
        </div>
      `
    );

    const token = createToken(user._id);
    res.status(201).json({ token });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

//                        -------------------------
//                              Login user
//                        -------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = createToken(user._id);
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------------
// Get current user profile
// -------------------------
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('GetProfile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------------
// Update user profile
// -------------------------
exports.updateProfile = async (req, res) => {
  try {
    const { username } = req.body;
    const update = {};

    if (username) update.username = username;
    if (req.file) update.profilePicture = `uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
    }).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error('UpdateProfile error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// -------------------------
// Request OTP
// -------------------------
exports.requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const code = generateOtp();
    await Otp.deleteMany({ email });
    await Otp.create({ email, code });

  await sendEmail(
  email,
  `Welcome Back ${user?.username}`,
  'Your OTP for Library Login',
  `
    <h2><strong>Welcome Back ${user?.username}</strong></h2>
    <h2>Your OTP is <strong>${code}</strong></h2>
    <h2>Thanks for choosing Personal Library Tracker</h2>
    <p>Regards from <a href="https://www.linkedin.com/in/yanshu-agarwal09/" target="_blank">
    Yanshu Agarwal</a></p>
  `
);



    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Request OTP Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const record = await Otp.findOne({ email });
    if (!record || record.code !== code) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await Otp.deleteMany({ email });

    const user = await User.findOne({ email });
    const token = createToken(user._id);

    res.json({
      message: 'OTP verified',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });
  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
