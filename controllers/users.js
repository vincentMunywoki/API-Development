const { User, Profile } = require('../models');
const { userSerializer, userWithProfileSerializer } = require('../serializers/user');
const { createUserSchema } = require('../validations/user');
const {validate } = require('../middlewares/validate');
const { checkUniqueEmail } = require('../middlewares/customValidate');

//Helper for query options (pagination, filter,search,sort)
const getQueryOptions = (req) => {
    const { limit = 10, offset = 0, search, sort } = req.query;
    const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        where: {},
        order: [['createdAt', 'DESC']], // Default sort
        paranoid: true // Respect soft-delets
    };

    //Filtering (exact match on fileds like email)
    if (req.body.email) options.where.email = req.query.email;

    // Searching (e.g on name)
    if (search) {
        options.where.name = { [require('sequelize').Op.iLike]: `%${search}` }; // Case-insensitive
    }

    //Sorting (format: field:direction)
    if (sort) {
        const [field,direction = 'ASC'] = sort.split(':');
        options.order = [[field, direction.toUpperCase()]];
    }

    return options;
};

//CREATE
const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(userSerializer(user));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//READ (List with pagination/filter/search/sort)
const getUsers = async (req, res) => {
    try { 
        const options = getQueryOptions(req);
        const { count, rows } = await User.findAndCountAll(options);
        res.json({
            total: count,
            users: rows.map(userSerializer),
            page: Math.floor(options.offset / options.limit) + 1,
            totalPages: Math.ceil(count / options.limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//READ (Single, With nested profile)
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { include: Profile });
        if (!user) return res.status(404).json({error: 'User not found'});
        res.json(userWithProfileSerializer(user));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update(req.body);
    res.json(userSerializer(user));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Suspend User
const suspendUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.active = false;
    await user.save();

    res.json({
      message: "User suspended successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Activate User
const activateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.active = true;
    await user.save();

    res.json({
      message: "User activated successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        verified: user.verified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();

    res.json({
      message: "User deleted successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { createUser, getUsers, getUserById, updateUser, deleteUser, activateUser, suspendUser };