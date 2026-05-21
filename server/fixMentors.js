const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dashboard')
  .then(async () => {
    console.log('Connected. Updating mentors...');
    const result = await User.updateMany(
      { role: 'mentor' }, 
      { $set: { isVerifiedMentor: true, isVerified: true } }
    );
    console.log('Update result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
