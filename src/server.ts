import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/v1', routes);

app.listen(process.env.APP_PORT);
