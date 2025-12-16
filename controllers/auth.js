const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/email');
const { User, RefreshToken, PasswordResetToken } = require('../models');
const { userSerializer } = require('../serializers/user');
const Joi = require('joi');
require('dotenv').config();

/* ===========================
      REGISTER USER
=========================== */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: 'Email already in use' });

    // Auto-assign admin role to you
    let role = "user";
    if (email === "vincentmunywoki12@gmail.com") {
      role = "admin";
    }


    // Create user
    const user = await User.create({ email, password, name, role });

    // Email verification token
    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EMAIL_VERIFICATION_EXP }
    );

    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;
    const html = `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`;

    await sendEmail(user.email, 'Verify Your Email', html);

    return res.status(201).json({
      message: `User registered successfully. Check your email for verification link.`,
      user: userSerializer(user)
    });

  } catch (error) {
    return res.status(500).json({ error: 'Registration failed' });
  }
};


/* ===========================
      VERIFY EMAIL
=========================== */
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verified) return res.json({ message: 'Email already verified' });

    user.verified = true;
    await user.save();

    res.json({ message: 'Email verified successfully' });

  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};


/* ===========================
  FORGOT PASSWORD
=========================== */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.PASSWORD_RESET_EXP }
    );

    const expiryDate = new Date(Date.now() + 3600000);

    await PasswordResetToken.create({ token: resetToken, userId: user.id, expiryDate });

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    // const html = `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`;
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2>Welcome to our platform!</h2>
    <p>Thank you for registering — we’re really glad to have you with us.</p>
    <p>If you ever need to reset your password, you can do so easily by clicking the link below:</p>
    <p><a href="${resetLink}" style="color: #4a90e2; font-weight: bold;">Reset your password</a></p>
    <p>If you didn’t request this, feel free to ignore the email.</p>
    <br/>
    <p>Warm regards,<br/>The Support Team</p>
    </div> `;


    await sendEmail(email, 'Password Reset', html);

    res.json({ message: 'Reset link sent to email' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===========================
       RESET PASSWORD
=========================== */
const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const storedToken = await PasswordResetToken.findOne({ where: { token } });
    if (!storedToken || storedToken.expiryDate < new Date()) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.password = newPassword; // plain password; hook will hash it
    await user.save();

    await storedToken.destroy();

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


/* ===========================
            LOGIN
=========================== */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.verified) return res.status(401).json({ error: 'Please verify your email' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Generate access token including role
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

/* ===========================
       REFRESH TOKEN
=========================== */
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!storedToken) return res.status(403).json({ error: 'Invalid refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });

    // NEW access token includes role
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Rotate refresh token
    await storedToken.destroy();

    const newRefreshToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
    );

    await RefreshToken.create({
      token: newRefreshToken,
      userId: user.id,
      expiryDate: new Date(Date.now() + 7 * 24 * 3600 * 1000)
    });

    res.json({ accessToken, refreshToken: newRefreshToken });

  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};


/* ===========================
    CHANGE PASSWORD
=========================== */
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const changePassword = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Incorrect old password' });

    user.password = await bcrypt.hash(req.body.newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  register,
  login,
  refresh,
  changePassword,
  forgotPassword,
  changePasswordSchema,
  resetPassword,
  resetPasswordSchema,
  verifyEmail
};
