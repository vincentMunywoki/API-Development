const express = require('express');
const authenticateJWT = require('../middlewares/authenticateJWT');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../validations/profile');
const { updateProfile } = require('../controllers/profiles');

const router = express.Router();

router.put('/', authenticateJWT, validate(updateProfileSchema), updateProfile);

module.exports = router;