const express = require('express');
const { createPostSchema } = require('../validations/post');
const authenticateJWT = require('../middlewares/authenticateJWT');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  addTagsToPost
} = require('../controllers/posts');
const { Post } = require('../models');

const router = express.Router();

// Middleware: allow only owner or admin
const ownerOrAdmin = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (req.user.role !== 'admin' && post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Not owner or admin' });
    }

    req.post = post;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// ================== POST ROUTES ==================

// Create a post
router.post('/', authenticateJWT, (req, res, next) => {
  const { error } = createPostSchema.validate(req.body);
  if (error) return res.status(400).json({ errors: error.details.map(d => d.message) });
  next();
}, createPost);

// Get all posts
router.get('/', authenticateJWT, getPosts);

// Get a single post by ID
router.get('/:id', authenticateJWT, getPostById);

// Update a post
router.put('/:id', authenticateJWT, ownerOrAdmin, updatePost);

// Delete a post
router.delete('/:id', authenticateJWT, ownerOrAdmin, deletePost);

// Add tags to a post
router.post('/:id/tags', authenticateJWT, ownerOrAdmin, addTagsToPost);

module.exports = router;
