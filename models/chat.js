const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
  userId: {
    type: String, 
    required: true, 
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  });
  
module.exports = mongoose.model('chat', chatSchema);
