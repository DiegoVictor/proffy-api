import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    name: Joi.string().required(),
    avatar: Joi.string().required(),
    whatsapp: Joi.string().min(11).required(),
    bio: Joi.string().min(20).required(),
    subject: Joi.string().required(),
    cost: Joi.number().required(),
    schedule: Joi.array().items(
      Joi.object().keys({
        week_day: Joi.number().min(0).max(7).required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
      }),
    ),
  },
});
