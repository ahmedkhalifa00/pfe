const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String, 
    required: false, 
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fcmToken: {
    type: String,
  },
  resetToken: String,
  resetTokenExpiration: Date,

  homeLocation: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
});

module.exports = mongoose.model('User', UserSchema);
