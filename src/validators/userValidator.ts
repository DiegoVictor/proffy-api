import { celebrate, Segments, Joi } from 'celebrate';

export const updateUserValidator = celebrate({
  [Segments.BODY]: {
    name: Joi.string(),
    surname: Joi.string(),
    avatar: Joi.string(),
    whatsapp: Joi.string().min(11),
    bio: Joi.string().min(20),
  },
});

export default celebrate({
  [Segments.BODY]: {
    name: Joi.string().required(),
    surname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    avatar: Joi.string().required(),
    whatsapp: Joi.string().min(11).required(),
    bio: Joi.string().min(20).required(),
  },
});
