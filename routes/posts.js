const express = require('express');
const { createPostSchema } = require('../validations/post');
const validate = require('../middlewares/validate');
const authenticateJWT = require('../middlewares/authenticateJWT');
const requireRole = require('../middlewares/requireRole');
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

// ================== POST ROUTES ==================

// Create a post (any authenticated user)
router.post(
  '/',
  authenticateJWT,
  validate(createPostSchema),
  createPost
);

// Get all posts (any authenticated user)
router.get(
  '/',
  authenticateJWT,
  getPosts
);

// Get a single post by ID (any authenticated user)
router.get(
  '/:id',
  authenticateJWT,
  getPostById
);

// Middleware: allow only owner or admin
const ownerOrAdmin = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (req.user.role !== 'admin' && post.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden: Not owner or admin' });
    }

    req.post = post; // attach post to request
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a post (owner or admin)
router.put(
  '/:id',
  authenticateJWT,
  ownerOrAdmin,
  updatePost
);

// Delete a post (owner or admin)
router.delete(
  '/:id',
  authenticateJWT,
  ownerOrAdmin,
  deletePost
);

// Add tags to a post (owner or admin)
router.post(
  '/:id/tags',
  authenticateJWT,
  ownerOrAdmin,
  addTagsToPost
);

module.exports = router;
