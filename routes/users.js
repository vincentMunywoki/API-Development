const express = require('express');
const { createUserSchema } = require('../validations/user');
const validate = require('../middlewares/validate');
const { checkUniqueEmail } = require('../middlewares/customValidate');
const { createUser, getUsers, getUserById, updateUser, deleteUser } = require('../controllers/users');
const { User, Profile } = require('../models');
const { userSerializer, userWithProfileSerializer } = require('../serializers/user');
const authenticateJWT = require('../middlewares/authenticateJWT');
const bcrypt = require('bcrypt');

const router = express.Router();

// Create User (with validation)
router.post('/', authenticateJWT, validate(createUserSchema), checkUniqueEmail, async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10); // Hash password
        const user = await User.create(req.body);
        res.status(201).json(userSerializer(user));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const users = await User.findAll({ include: Profile });
        res.json(users.map(userWithProfileSerializer));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Get User with Profile
router.get('/:id', authenticateJWT,  async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { include: Profile });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(userWithProfileSerializer(user));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User
router.put('/:id', authenticateJWT,  async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.update(req.body);
        res.json(userSerializer(user));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete User
router.delete('/:id', authenticateJWT,  async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.destroy(); // Or soft delete if you have paranoid
        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;


