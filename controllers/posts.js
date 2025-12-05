const { Post, User } = require("../models");

// CREATE POST
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const post = await Post.create({
      title,
      content: content || '',
      userId: req.user.userId
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while creating post" });
  }
};

// GET ALL POSTS
const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [{ model: User, attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]]
    });

    // Map posts to include user info properly
    const serializedPosts = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      userId: post.userId,
      user: post.User ? { id: post.User.id, name: post.User.name, email: post.User.email } : null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    return res.json({ success: true, posts: serializedPosts });
  } catch (err) {
    console.error("Get Posts Error:", err);
    return res.status(500).json({ error: "Server error while fetching posts" });
  }
};

// GET SINGLE POST
const getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ["id", "name", "email"] }]
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching post" });
  }
};

// UPDATE POST
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const post = await Post.findByPk(id);

    if (!post) return res.status(404).json({ error: "Post not found" });

    // Only author or admin can update
    if (post.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden" });
    }

    post.title = title ?? post.title;
    post.content = content ?? post.content;
    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while updating post" });
  }
};

// DELETE POST
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (post.userId !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ error: "Forbidden" });

    await post.destroy();
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while deleting post" });
  }
};

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
