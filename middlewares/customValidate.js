const { User } = require('../models');

const checkUniqueEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ errors: ['Email already in use'] });
    }

    next();
  } catch (error) {
    console.error('Error in checkUniqueEmail middleware:', error);
    res.status(500).json({ errors: ['Server error'] });
  }
};

module.exports = { checkUniqueEmail };
