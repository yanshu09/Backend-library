const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

router.get('/profile', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});

router.put('/profile', auth, upload.single('image'), async (req, res) => {
  const user = await User.findById(req.userId);
  user.name = req.body.name || user.name;
  if (req.file) {
    user.imageUrl = req.file.path;
  }
  await user.save();
  res.json(user);
});

module.exports = router;
