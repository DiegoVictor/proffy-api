import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';

const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const routes = express.Router();

routes.get('/connections', connectionsController.index);
routes.post('/connections', connectionsController.store);

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.store);

export default routes;
