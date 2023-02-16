import { Router } from 'express';

import { ConnectionsController } from '../controllers/ConnectionsController';
import userIdValidator from '../validators/userIdValidator';

const connectionsController = new ConnectionsController();

const app = Router();

app.get('/', connectionsController.index);
app.post('/', userIdValidator, connectionsController.store);

export default app;
