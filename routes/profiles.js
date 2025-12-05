const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const validate = require('../middlewares/validate');
const { createProfileSchema, updateProfileSchema } = require('../validations/profile');
const { createProfile, getProfile, updateProfile } = require('../controllers/profiles');

const router = express.Router();

// Create profile
router.post('/', authenticateJWT, validate(createProfileSchema), createProfile);

// Get profile
router.get('/', authenticateJWT, getProfile);

// Update profile
router.put('/', authenticateJWT, validate(updateProfileSchema), updateProfile);

module.exports = router;