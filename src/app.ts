import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errors } from 'celebrate';
import helmet from 'helmet';

import routes from './routes';
import RouteAliases from './middlewares/RouteAliases';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(RouteAliases);
app.use('/v1', routes);

app.use(errors());

export default app;
