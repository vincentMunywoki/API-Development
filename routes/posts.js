const express = require('express');
const validate = require('../middlewares/validate');
const { createPostSchema } = require('../controllers/posts'); // Schema is in controller for simplicity
const { createPost, getPosts, getPostById, updatePost, deletePost, addTagsToPost } = require('../controllers/posts');

const router = express.Router();

router.post('/', validate(createPostSchema), createPost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/tags', addTagsToPost);

module.exports = router;