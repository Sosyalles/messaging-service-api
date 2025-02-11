import { Joi } from 'celebrate';

export const authValidation = {
  register: {
    body: Joi.object().keys({
      username: Joi.string().required().min(3).max(30).messages({
        'string.base': 'Username must be a string',
        'string.empty': 'Username cannot be empty',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
      email: Joi.string().required().email().messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().required().min(6).max(30)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
          'string.base': 'Password must be a string',
          'string.empty': 'Password cannot be empty',
          'string.min': 'Password must be at least 6 characters long',
          'string.max': 'Password cannot exceed 30 characters',
          'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
          'any.required': 'Password is required'
        })
    })
  },

  login: {
    body: Joi.object().keys({
      email: Joi.string().required().email().messages({
        'string.base': 'Email must be a string',
        'string.empty': 'Email cannot be empty',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
      password: Joi.string().required().messages({
        'string.base': 'Password must be a string',
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required'
      })
    })
  }
}; 