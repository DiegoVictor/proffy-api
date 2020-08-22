import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    password: Joi.string().required(),
    password_confirmation: Joi.string().required().valid(Joi.ref('password')),
    token: Joi.string().required(),
  },
});
