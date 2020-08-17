import { celebrate, Segments, Joi } from 'celebrate';

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
