const User = require('../models/User');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

router.post(
  '/register',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  authController.register
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

// Forgot Password Route
router.post(
  '/forgot-password',
  [check('email', 'Please include a valid email').isEmail()],
  authController.forgotPassword
);

// Reset Password Route
router.post(
  '/reset-password',
  [
    check('token', 'Token is required').exists(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  authController.resetPassword
);

// Save home location
router.post('/user/:id/home-location', (req, res) => {
  const { latitude, longitude } = req.body;
  User.findByIdAndUpdate(req.params.id, { homeLocation: { latitude, longitude } }, { new: true })
    .then(user => res.json(user))
    .catch(err => res.status(400).json({ error: err.message }));
}
);

module.exports = router;
