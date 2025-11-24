const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, RefreshToken } = require('../models');
const { userSerializer } = require('../serializers/user');
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
    res.status(500).json({ error: 'Login failed' });
  }
};

// REFRESH TOKEN
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    // Verify and find stored refresh token
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!storedToken || storedToken.expiryDate < new Date()) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Verify JWT signature
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: (await User.findByPk(decoded.userId)).email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Optionally rotate refresh token (issue new one, delete old)
    await storedToken.destroy();
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ token: newRefreshToken, userId: decoded.userId, expiryDate: newExpiry });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};

module.exports = { register, login, refresh };