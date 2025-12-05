const Joi = require("joi");

exports.createPostSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().required()
});

exports.updatePostSchema = Joi.object({
  title: Joi.string(),
  content: Joi.string().optional()
});
