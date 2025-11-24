const express = require('express');
const { register, login, refresh } = require('../controllers/auth');
const { createUserSchema } = require('../validations/user'); // Reuse from Day 3
const validate = require('../middlewares/validate');

const router = express.Router();

router.post('/register', validate(createUserSchema), register);
router.post('/login', login);
router.post('/refresh', refresh);

module.exports = router;