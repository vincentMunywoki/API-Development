const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middlewares/authenticateJWT");
const { createPost, getPosts, getPostById, updatePost, deletePost } = require("../controllers/posts");

// GET ALL POSTS
router.get("/", getPosts);

// GET SINGLE POST
router.get("/:id", getPostById);

// CREATE POST
router.post("/", authenticateJWT, createPost);

// UPDATE POST
router.put("/:id", authenticateJWT, updatePost);

// DELETE POST
router.delete("/:id", authenticateJWT, deletePost);

module.exports = router;
