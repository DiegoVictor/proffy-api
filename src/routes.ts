import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import UsersController from './controllers/UsersController';
import SessionsController from './controllers/SessionsController';
import userIdValidator from './validator/userIdValidator';
import classFiltersValidator from './validator/classFiltersValidator';
import classValidator from './validator/classValidator';
import sessionValidator from './validator/sessionValidator';

const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const sessionsController = new SessionsController();
const usersController = new UsersController();
const routes = express.Router();

routes.post('/sessions', sessionValidator, sessionsController.store);

routes.get('/connections', connectionsController.index);
routes.post('/connections', userIdValidator, connectionsController.store);

routes.post('/users', userValidator, usersController.store);
routes.get('/classes', classFiltersValidator, classesController.index);
routes.post('/classes', classValidator, classesController.store);

export default routes;
