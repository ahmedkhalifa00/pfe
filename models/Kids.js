const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KidSchema = new Schema({
  name: { type: String, required: false },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  linkCode: {
    type: String,
  },
  linkCodeExpiration: {
    type: Date,
  },
  location: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    timestamp: { type: Date, default: Date.now }
  },
  homeLocation: {
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    radius: { type: Number, required: false } 
  },
  locationHistory: [
    {
      latitude: Number,
      longitude: Number,
      timestamp: Date,
    },
  ],
  connectedUsers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      fullName: { type: String }
    }
  ]
});


module.exports = mongoose.model('Kids', KidSchema);

