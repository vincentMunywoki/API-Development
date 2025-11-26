const express = require('express');
const { register, login, refresh } = require('../controllers/auth');
const { createUserSchema } = require('../validations/user'); // Reuse from Day 3
const validate = require('../middlewares/validate');
const { required } = require('joi');
const { changePasswordSchema, changePassword } = require('../controllers/auth');
const authenticateJWT = require('../middlewares/authenticateJWT');
const { resetPasswordSchema, verifyEmail, forgotPassword, resetPassword } = require('../controllers/auth'); 

const router = express.Router();

router.post('/register', validate(createUserSchema), register);
router.post('/login', login);
router.post('/refresh', refresh);
router.put('/change-password', authenticateJWT, validate(changePasswordSchema), changePassword);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

module.exports = router;