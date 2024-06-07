
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KidSchema = new Schema({
  name: { type: String, required: true },
  parentId: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
  }
});

module.exports = mongoose.model('Kid', KidSchema);
