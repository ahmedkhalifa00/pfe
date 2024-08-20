const express = require('express');
const Kid = require('../models/Kids');
const User = require('../models/User');
const admin = require('./firebaseService');
const router = express.Router();

router.post('/sos-alert', async (req, res) => {
  const { kidId } = req.body;

  try {
    // Find the kid and parent(s) to notify
    const kid = await Kid.findById(kidId).populate('connectedUsers.userId');

    if (!kid) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    // Send a sound notification to each connected parent
    const notifications = kid.connectedUsers.map(user => {
      return sendSoundNotification(user.userId);
    });

    await Promise.all(notifications);

    res.json({ success: true, msg: 'SOS alert sent successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

async function sendSoundNotification(userId) {
  const parent = await User.findById(userId);

  if (parent && parent.fcmToken) {
    const message = {
      notification: {
        title: 'SOS Alert!',
        body: 'Your child needs help!',
        sound: 'sos_sound',  // Custom sound file name
      },
      token: parent.fcmToken,
    };

    return admin.messaging().send(message)
      .then(response => {
        console.log('Successfully sent message:', response);
      })
      .catch(error => {
        console.log('Error sending message:', error);
      });
  }
}

router.post('/link-additional-parent', async (req, res) => {
  const { kidId, parentId } = req.body;

  try {
    // Find the parent by ID
    const parent = await User.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Find the kid by ID
    const kid = await Kid.findById(kidId);
    if (!kid) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    // Check if this parent is already linked
    const isAlreadyLinked = kid.connectedUsers.some(user => user.userId.equals(parent._id));

    if (isAlreadyLinked) {
      return res.status(400).json({ error: 'This parent is already linked to the kid' });
    }

    // Add the new parent to the connectedUsers array
    kid.connectedUsers.push({ userId: parent._id, fullName: parent.fullName });

    await kid.save();

    res.json({ msg: 'Additional parent linked successfully', kid });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
