const Joi = require ('joi');

const createUserSchema = Joi.object({
    email: Joi.string().email().required(),
    password:Joi.string().domain(6).required(),
    name: Joi.string(50).optional()
});

module.exports = { createUserSchema };