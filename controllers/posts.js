const { Post, User, Tag } = require('../modles');
const Joi = require('joi');
const validate = require('../middlewares/validate');

// Simple Post Schema
const createPostSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().optional(),
    userId: Joi.number().integer().required()
});

//Serializer for Post
const postSerializer = (post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    slug: post.slug,
    userId: post.userId,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt
});

// Nested with user and Tags
const postWithRelationsSerializer = (post) => ({
    ...postSerializer(post),
    user: post.User ? { id: post.User.id, name: post.User.name } : null,
    tags: post.Tags ? post.Tags.map(tag => ({ id: tag.id, name: tag.name })) : []
});

// Query options helper
const getQueryOptions = (req) => {
    const { limit = 10, offset = 0, search, sort } = req.query;
    const options = {
        limit: parseInt(limit),
        offset: parseInt(offset),
        where: {}, 
        order: [['createdAt', 'DESC']],
        include: [User, Tag], // Eager load relations
        paranoid: true
    };

    // Filtrering (eg by userId)
    if (req.query.userId) options.where.userId = req.query.userId;

    // Searching (on title or content)
    if (search) {
        options.where[require('sequelize').Op.or] = [
            { title: { [require('sequelize').Op.iLike]: `%${search}%`}},
            { content: { [require('sequelize').Op.iLike]: `%${search}%`}}
        ];
    }

    //Sorting
    if (sort) {
        const [field, directon = 'ASC'] = sort.split(':');
        options.order = [[ field, direction.toUpperCase()]];
    }

    return options;
};

//CREATE
const createPost = async (req, res) => {
    try {
        const post = await Post.create(req.body);
        res.status(201).json(postSerializer(post));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//READ (LIST)
const getPosts = async (req, res) => {
    try {
        const options = getQueryOptions(req);
        const { count, rows } = await Post.findAndCountAll(options);
        res.json({
            total: count,
            posts: rows.map(postWithRelationsSerializer),
            page: Math.floor(options.offset / options.limit) + 1,
            totalPages: Math.ceil(count / options.limit)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Read (Single)
const getPostById = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, { include: [User, Tag] });
        if(!post) return res.status(404).json({ error: 'Post Not Found' });
        res.json(postWithRelationsSerializer(post));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Update
const updatePost = async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post Not Found'});
        await post.update(req.body);
        res.json(postSerializer(post));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//DELETE (SOFT)
const deletePost = async (req,res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({error: 'Post not Found' });
        await post.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a route to associate Tags (Many-to-Many)
const addTagsToPost = async (req, res) => {
    try { 
        const post = await Post.findByPk(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post Not Found'});
        const tags = await Tag.findAll({ where: { id: req.body.tagIds } });
        await post.addTags(tags);
        res.json(postWithRelationsSerializer(await Post.findByPk(req.params.id, { include: Tag })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost, addTagsToPost };