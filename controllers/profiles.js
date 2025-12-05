const { Profile } = require('../models');
const { profileSerializer } = require('../serializers/user'); // From Day 3')

// CREATE Profile
const createProfile = async (req, res) => {
  try {
    const existing = await Profile.findOne({ where: { userId: req.user.userId }});
    if (existing) return res.status(400).json({ error: 'Profile already exists' });

    const profile = await Profile.create({
      userId: req.user.userId,
      bio: req.body.bio || "",
      location: req.body.location || ""
    });

    res.status(201).json(profileSerializer(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ where: { userId: req.user.userId }});
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json(profileSerializer(profile));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE Profile (protected)
const updateProfile = async (req, res) => {
    try {
        // Find profile for the authenticated user
        const profile = await Profile.findOne({ where: { userId: req.user.userId }});
        if (!profile) return res.status(404).json({ error: 'Profile not found' });

        // Update profile with request body
        await profile.update(req.body);

         // Send serialized profile
        res.json(profileSerializer(profile));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { updateProfile, createProfile, getProfile };