require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const app = express();

//  Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

// 🔧 Middleware
app.use(cors());
app.use(express.json());

//  Serve static files (uploaded images & PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//  Route Imports
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const authOtpRoutes = require('./src/routes/authOtp'); 

const feedbackRoutes = require('./src/routes/feedback');

// 🚏 Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/otp', authOtpRoutes);
app.use('/api/feedback', feedbackRoutes);

// ⬇️ File download route (optional, for uploaded files)
app.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

//  Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

//  Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
