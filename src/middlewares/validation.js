const Joi = require('joi');

const messageSchema = Joi.object({
  receiverId: Joi.number().required(),
  content: Joi.string().required().min(1).max(1000),
});

const validateMessage = (req, res, next) => {
  const { error } = messageSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = {
  validateMessage,
}; 