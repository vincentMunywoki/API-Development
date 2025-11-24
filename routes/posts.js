const express = require('express');
const validate = require('../middlewares/validate');
const { createPostSchema } = require('../controllers/posts'); // Schema is in controller for simplicity
const { createPost, getPosts, getPostById, updatePost, deletePost, addTagsToPost } = require('../controllers/posts');
const authenticateJWT = require('../middlewares/authenticateJWT');

const router = express.Router();

router.post('/', authenticateJWT,  validate(createPostSchema), createPost);
router.get('/', authenticateJWT, getPosts);
router.get('/:id', authenticateJWT,  getPostById);
router.put('/:id', authenticateJWT,  updatePost);
router.delete('/:id', authenticateJWT,  deletePost);
router.post('/:id/tags', authenticateJWT,  addTagsToPost);

module.exports = router;