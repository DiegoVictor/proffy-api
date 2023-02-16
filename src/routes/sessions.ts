import { Router } from 'express';

import { SessionsController } from '../controllers/SessionsController';
import sessionValidator from '../validators/sessionValidator';

const sessionsController = new SessionsController();

const app = Router();

app.post('/', sessionValidator, sessionsController.store);

export default app;
