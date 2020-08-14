import 'dotenv/config';
import 'express-async-errors';

import express, { NextFunction, Response, Request } from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import helmet from 'helmet';
import { isBoom } from '@hapi/boom';

import routes from './routes';
import RouteAliases from './middlewares/RouteAliases';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(RouteAliases);
app.use('/v1', routes);

app.use(errors());
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (isBoom(err)) {
    const { statusCode, payload } = err.output;

    return res.status(statusCode).json({
      ...payload,
      ...err.data,
      docs: process.env.DOCS_URL,
    });
  }

  return next(err);
});

export default app;
