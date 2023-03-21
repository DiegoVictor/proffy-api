import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: {
    user_id: Joi.number().required(),
    subject: Joi.string().required(),
    cost: Joi.number().required(),
    schedules: Joi.array().items(
      Joi.object().keys({
        week_day: Joi.number().min(0).max(7).required(),
        from: Joi.string().required(),
        to: Joi.string().required(),
      }),
    ),
  },
});
