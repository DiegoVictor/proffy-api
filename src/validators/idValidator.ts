import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.PARAMS]: {
    id: Joi.number().required(),
  },
});
