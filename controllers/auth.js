const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, RefreshToken } = require('../models');
const { userSerializer } = require('../serializers/user');
const Joi = require('joi');
require('dotenv').config();

// REGISTER
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    const user = await User.create({ email, password, name });
    res.status(201).json(userSerializer(user));
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Generate and store refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await RefreshToken.create({ token: refreshToken, userId: user.id, expiryDate });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// REFRESH TOKEN
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!storedToken || storedToken.expiryDate < new Date()) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Rotate refresh token
    await storedToken.destroy();
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ token: newRefreshToken, userId: user.id, expiryDate: newExpiry });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

// CHANGE PASSWORD
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required().pattern(new RegExp('[@#$%^&+=]'))
}).messages({
  'string.pattern.base': 'New password must contain at least one special character (@#$%^&+=)'
});

const changePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect old password' });

    user.password = req.body.newPassword; // Hook will hash it
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login, refresh, changePassword, changePasswordSchema };
