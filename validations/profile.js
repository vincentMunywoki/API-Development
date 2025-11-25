const Joi = require('joi');

const updateProfileSchema = Joi.object({
    bio: Joi.string().optional(),
    location: Joi.string().optional()
});

module.exports = { updateProfileSchema };