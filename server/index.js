const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGODB_URI = 'mongodb://127.0.0.1:27017/aura-hub';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('🍃 Linked to Aura Hub Database (MongoDB)'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT, () => {
  console.log(`Aura Hub Live on Port ${PORT}`);
});
