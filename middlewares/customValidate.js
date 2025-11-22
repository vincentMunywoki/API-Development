const { User } = require('../models');

const checkUniqueEmail = async (req, res, next) => {
    const { email } = req.body;
    constexistingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json ({ errors: ['Email already in use']});
    }
    next();
};

module.exports = { checkUniqueEmail };