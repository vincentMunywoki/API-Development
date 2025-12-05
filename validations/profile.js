const Joi = require('joi');

const createProfileSchema = Joi.object({
  bio: Joi.string().allow(''),
  location: Joi.string().allow('')
});

const updateProfileSchema = Joi.object({
  bio: Joi.string().allow(''),
  location: Joi.string().allow('')
});

module.exports = { createProfileSchema, updateProfileSchema };
