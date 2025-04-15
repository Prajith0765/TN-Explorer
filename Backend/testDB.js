require('dotenv').config();
const mongoose = require('mongoose');

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Connection error:', error.message);
  }
};

testDB();