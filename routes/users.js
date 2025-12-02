const express = require('express');
const { createUserSchema } = require('../validations/user');
const validate = require('../middlewares/validate');
const { checkUniqueEmail } = require('../middlewares/customValidate');
const { User, Profile } = require('../models');
const { userSerializer, userWithProfileSerializer } = require('../serializers/user');
const authenticateJWT = require('../middlewares/authenticateJWT');
const requireRole = require('../middlewares/requireRole');
const bcrypt = require('bcrypt');

const router = express.Router();

// ================== ADMIN ROUTES ==================

// Create User (ADMIN ONLY)
router.post(
  '/',
  authenticateJWT,
  requireRole('admin'),
  validate(createUserSchema),
  checkUniqueEmail,
  async (req, res) => {
    try {
      req.body.password = await bcrypt.hash(req.body.password, 10);
      const user = await User.create(req.body);
      res.status(201).json(userSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get all users (ADMIN ONLY)
router.get(
  '/',
  authenticateJWT,
  requireRole('admin'),
  async (req, res) => {
    try {
      const users = await User.findAll({ include: Profile });
      res.json(users.map(userWithProfileSerializer));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get user by ID (ADMIN ONLY)
router.get(
  '/:id',
  authenticateJWT,
  requireRole('admin'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, { include: Profile });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(userWithProfileSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update user (ADMIN ONLY)
router.put(
  '/:id',
  authenticateJWT,
  requireRole('admin'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await user.update(req.body);
      res.json(userSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Delete user (ADMIN ONLY)
router.delete(
  '/:id',
  authenticateJWT,
  requireRole('admin'),
  async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await user.destroy(); // or soft delete
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// ================== USER ROUTES ==================

// Get own profile
router.get(
  '/me/profile',
  authenticateJWT,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId, { include: Profile });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(userWithProfileSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update own profile
router.put(
  '/me/profile',
  authenticateJWT,
  async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      await user.update(req.body);
      res.json(userSerializer(user));
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

module.exports = router;
