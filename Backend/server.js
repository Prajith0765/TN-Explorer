const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const placesRoutes = require('./routes/places');

const app = express();

app.use(cors());
app.use(express.json());

// Use MongoDB Atlas connection string
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tamilnadu_explorer', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/places', placesRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));