const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/workers', require('./routes/workers'));
app.use('/api/policies', require('./routes/policies'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/triggers', require('./routes/triggers'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/weather', require('./routes/weather'));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'))
  );
}

// Connect DB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    }
  })
  .catch((err) => console.error('❌ DB Error:', err));

module.exports = app;
