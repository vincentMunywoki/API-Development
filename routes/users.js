const express = require("express");
const jwt = require('jsonwebtoken');
const { createUserSchema } = require("../validations/user");
const { checkUniqueEmail } = require("../middlewares/customValidate");
const { User, Profile } = require("../models");
const { userSerializer, userWithProfileSerializer } = require("../serializers/user");
const authenticateJWT = require("../middlewares/authenticateJWT");
const requireRole = require("../middlewares/requireRole");
const bcrypt = require("bcrypt");

const router = express.Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
  activateUser,
  } = require("../controllers/users");
const { sendEmail } = require("../services/email");

// ================== PUBLIC ROUTES ==================

// Public Registration
router.post(
  "/register",
  checkUniqueEmail,
  (req, res, next) => {
    const { error } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
    next();
  },
  async (req, res) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const user = await User.create(req.body);
      res.status(201).json(userSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ================== ADMIN ROUTES ==================

// List all users (ADMIN)
router.get("/", authenticateJWT, requireRole("admin"), async (req, res) => {
  try {
    const users = await User.findAll({ include: Profile });
    res.json(users.map(userWithProfileSerializer));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get single user by ID (ADMIN)
router.get("/:id", authenticateJWT, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, { include: Profile });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(userWithProfileSerializer(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create user (ADMIN)
router.post(
  "/",
  authenticateJWT,
  requireRole("admin"),
  checkUniqueEmail,
  (req, res, next) => {
    const { error } = createUserSchema.validate(req.body);
    if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
    next();
  },
  async (req, res) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const user = await User.create(req.body);
      res.status(201).json(userSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Suspend user (ADMIN)
router.patch("/:id/suspend", authenticateJWT, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.active = false;
    await user.save();
    res.json({ message: "User suspended successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Activate user (ADMIN)
router.patch("/:id/activate", authenticateJWT, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.active = true;
    await user.save();
    res.json({ message: "User activated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user (ADMIN)
router.put("/:id", authenticateJWT, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.update(req.body);
    res.json(userSerializer(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (ADMIN)
router.delete("/:id", authenticateJWT, requireRole("admin"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.destroy(); // or soft delete
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== SELF-PROFILE ROUTES ==================

// Get own profile
router.get("/me/profile", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, { include: Profile });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(userWithProfileSerializer(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update own profile
router.put("/me/profile", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    await user.update(req.body);
    res.json(userSerializer(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create Admin - only for existing admins

/* router.post('/create-admin', authenticateJWT, async (req, res) => {
  try {
    const requestingUser = req.user;

    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create other admins' });
    }

    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const newAdmin = await User.create({ email, password, name, role: 'admin' });

    res.status(201).json({
      message: 'Admin created successfully',
      admin: { id: newAdmin.id, email: newAdmin.email, name: newAdmin.name }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}); */

router.post('/create-admin', authenticateJWT, async (req, res) => {
  try {
    // Only admins can create admins
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create other admins'});
    }

    const { email, password, name } = req.body;

    // prevent duplicates
    const existingUser = await User.findOne({ where: { email }});
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Create admin - NOT VERIFIED
    const newAdmin = await User.create({
      email,
      password,
      name,
      role: 'admin',
      verified: false
    });

    // Generate verification token
    const verificationToken = jwt.sign(
      { userId: newAdmin.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.EMAIL_VERIFICATION_EXP }
    );

    const verificationLink = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`;

    const html = `
    <p>You have been added as an administrator.</p>
    <p>Please verify your email to activate your admin account:</p>
    <p><a href="${verificationLink}"> Verify Email</a></p>
    `;

    // Send Verification email
    await sendEmail(newAdmin.email, 'Verify Your Admin Account', html);

    return res.status(201).json({
      message: 'Admin created successfully. Verification email sent.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create admin' });
  }
});
module.exports = router;
