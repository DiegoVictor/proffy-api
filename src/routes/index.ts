import express from 'express';

import classes from './classes';
import sessions from './sessions';
import users from './users';
import Auth from '../middlewares/Auth';

const app = express.Router();

app.use('/sessions', sessions);
app.use('/users', users);

app.use(Auth);

app.use('/classes', classes);
export default app;
