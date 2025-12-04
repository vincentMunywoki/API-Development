const Joi = require ('joi');

const createUserSchema = Joi.object({
    email: Joi.string().email().lowercase().required().custom((value, helpers) => {
        if (value.endsWith('@example.com')) {
            return helpers.error('any.invalid'); // Custom:Ban example.com domains
        }
        return value;
    }, 'custom email validation'),
    password:Joi.string().min(6).required().pattern(new RegExp('[@#$%^&+=]')), // Custom: Must have special char
    name: Joi.string().max(50).optional()
}) .messages ({
    'string.pattern.base': 'Password must contain at least one special character (@#$%^&+=)'
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .min(6)
    .required()
    .pattern(new RegExp('[@#$%^&+=]'))
}).messages({
  'string.min': 'Password must be at least 6 characters',
  'string.pattern.base': 'Password must contain at least one special character (@#$%^&+=)',
  'any.required': 'Password is required'
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(6)
    .required()
    .pattern(new RegExp('[@#$%^&+=]'))
}).messages({
  'string.min': 'Password must be at least 6 characters',
  'string.pattern.base': 'Password must contain at least one special character (@#$%^&+=)',
  'any.required': 'Password is required'
});

module.exports = { createUserSchema, resetPasswordSchema, changePasswordSchema };

