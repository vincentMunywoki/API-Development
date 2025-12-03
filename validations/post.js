// validations/post.js
const Joi = require('joi');

const createPostSchema = Joi.object({
  title: Joi.string().min(3).required(),
  content: Joi.string().required()
});

module.exports = { createPostSchema };
