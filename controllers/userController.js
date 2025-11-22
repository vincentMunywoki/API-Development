const { User } = require('../models');
const { userSerializer } = require('../serializers/user');

const createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(userSerializer(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createUser };
