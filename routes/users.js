const express = require('express');
const { createUserSchema } = require('../validations/user');
const validate = require('../middlewares/validate');
const { checkUniqueEmail } = require('../middlewares/customValidate');
const { User, Profile } = require('../models');
const { userSerializer, userWithProfileSerializer } = require ('../serializers/user');


const router = express.Router();

//Create User (with validation)
router.post('/', validate(createUserSchema), checkUniqueEmail, async (req, res) => {
    try {
        const user = await User.create(req.body); // <<>> Hash password in real app!
        res.status(201).json(userSerializer(user)); // Serialized response
    } catch (error) {
        res.stutas(500).json({ error: 'Server error' });
    }
});

// Get User with Profile (nested serializer)
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findByPK(req.params.id, { include: Profile });
        if (!user) return res.status(404).json({ error : 'User not found' });
        res.json(userWithProfileSerializer(user)); //Nested output
    } catch (error) {
        res.status(500).json({ error: 'Servr error' });
    }
});

module.exports = router;