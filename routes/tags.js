const express = require('express');
const { Tag } = require('../models'); // Make sure Tag model exists
const router = express.Router();

// Create a Tag
router.post('/', async (req, res) => {
    try {
        const tag = await Tag.create(req.body);
        res.status(201).json(tag);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

// List all Tags
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.findAll();
        res.json(tags);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
