import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.QUERY]: Joi.object({
    page: Joi.number(),
  }).unknown(),
});
