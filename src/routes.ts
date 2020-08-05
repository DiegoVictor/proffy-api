import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import userIdValidator from './validator/userIdValidator';
import classFiltersValidator from './validator/classFiltersValidator';
import classValidator from './validator/classValidator';

const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const routes = express.Router();

routes.get('/connections', connectionsController.index);
routes.post('/connections', userIdValidator, connectionsController.store);

routes.get('/classes', classFiltersValidator, classesController.index);
routes.post('/classes', classValidator, classesController.store);

export default routes;
