import { Joi } from 'celebrate';

export const messageValidation = {
  sendMessage: {
    body: Joi.object().keys({
      receiverId: Joi.number().required().messages({
        'number.base': 'Receiver ID must be a number',
        'any.required': 'Receiver ID is required'
      }),
      content: Joi.string().required().min(1).max(1000).messages({
        'string.base': 'Message content must be a string',
        'string.empty': 'Message content cannot be empty',
        'string.min': 'Message content must be at least 1 character long',
        'string.max': 'Message content cannot exceed 1000 characters',
        'any.required': 'Message content is required'
      })
    })
  },

  getConversation: {
    params: Joi.object().keys({
      receiverId: Joi.number().required().messages({
        'number.base': 'Receiver ID must be a number',
        'any.required': 'Receiver ID is required'
      })
    })
  },

  deleteMessage: {
    params: Joi.object().keys({
      messageId: Joi.number().required().messages({
        'number.base': 'Message ID must be a number',
        'any.required': 'Message ID is required'
      })
    })
  },

  markMessageAsRead: {
    params: Joi.object().keys({
      messageId: Joi.number().required().messages({
        'number.base': 'Message ID must be a number',
        'any.required': 'Message ID is required'
      })
    })
  }
}; 