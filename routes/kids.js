const express = require('express');
const Kid = require('../models/Kids');
const User = require('../models/User');
const router = express.Router();



router.post('/generate-link-code', async (req, res) => {
  try {
    const { parentId } = req.body;  // Parent ID is passed here
    const linkCode = Math.random().toString(36).substring(2, 7).toUpperCase(); // Generate a 5-character code
    const linkCodeExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000); // Code expires in 24 hours

    // Create a new temporary kid record
    const kid = new Kid({
      name: null, // Name is null initially
      parentId: parentId , // No parent linked yet
      location: { latitude: null, longitude: null }, // Placeholder coordinates
      linkCode,
      linkCodeExpiration,
      connectedUsers: [{ userId: parentId, fullName: null }]  // Link the parent temporarily
    });

    await kid.save();

    res.json({ linkCode: kid.linkCode, linkCodeExpiration: kid.linkCodeExpiration });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create-kid', async (req, res) => {
  const { linkCode } = req.body;

  try {
    // Find the kid using the link code and ensure it hasn't expired
    const kid = await Kid.findOne({ linkCode, linkCodeExpiration: { $gt: Date.now() } });

    if (!kid) {
      return res.status(400).json({ error: 'Invalid or expired link code' });
    }

    // Retrieve the parent associated with the kid
    const parent = await User.findById(kid.parentId);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found' });
    }

    // Clear the link code and its expiration
    kid.linkCode = undefined;
    kid.linkCodeExpiration = undefined;

    // Add the parent to the connectedUsers array if not already present
    const existingUserIndex = kid.connectedUsers.findIndex(user => user.userId.equals(parent._id));

    if (existingUserIndex === -1) {
      kid.connectedUsers.push({ userId: parent._id, fullName: parent.fullName });
    } else {
      // Ensure the fullName is updated in case it wasn't previously set
      kid.connectedUsers[existingUserIndex].fullName = parent.fullName;
    }

    await kid.save();

    res.json({ msg: 'Kid linked successfully', kid });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});





// Delete a kid by ID
router.delete('/kids/:id', (req, res) => {
  Kid.findByIdAndDelete(req.params.id)
    .then((kid) => {
      if (!kid) {
        return res.status(404).json({ error: 'Kid not found' });
      }
      res.json({ message: 'Kid successfully deleted' });
    })
    .catch((err) => res.status(400).json({ error: err.message }));
});

// Get all kids for a parent
router.get('/parents/:parentId/kids', (req, res) => {
  Kid.find({ parentId: req.params.parentId })
    .then(kids => res.json(kids))
    .catch(err => res.status(400).json({ error: err.message }));
});



router.get('/connected-users/:kidId', async (req, res) => {
  try {
    const { kidId } = req.params;
    const kid = await Kid.findById(kidId);

    if (!kid) {
      return res.status(404).json({ error: 'Kid not found' });
    }

    // Return the connectedUsers array directly
    res.json(kid.connectedUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/sos-alert', async (req, res) => {
  const { kidId } = req.body;

  try {
      // Find the kid and parent(s) to notify
      const kid = await Kid.findById(kidId).populate('connectedUsers.userId');

      if (!kid) {
          return res.status(404).json({ error: 'Kid not found' });
      }

      // Logic to notify the parent(s) with a sound notification
      kid.connectedUsers.forEach(user => {
          sendSoundNotification(user.userId);
      });

      res.json({ success: true, msg: 'SOS alert sent successfully' });
  } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Server error' });
  }
});

function sendSoundNotification(userId) {
  // Implement the logic to trigger a sound notification on the parent app
  // This could be done using push notifications with a specific sound
}


module.exports = router;
