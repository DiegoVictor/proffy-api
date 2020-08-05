import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.QUERY]: Joi.object().keys({
    week_day: Joi.number().min(0).max(7).required(),
    subject: Joi.string().required(),
    time: Joi.string().required(),
  }),
});
