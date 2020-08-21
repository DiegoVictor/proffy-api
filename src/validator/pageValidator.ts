import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.QUERY]: {
    page: Joi.number(),
  },
});
