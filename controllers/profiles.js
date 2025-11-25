const { Profile } = require('../models');
const { profileSerializer } = require('../serializers/user'); // From Day 3')

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

module.exports = { updateProfile };