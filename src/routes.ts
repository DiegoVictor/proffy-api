import express from 'express';

import ClassesController from './controllers/ClassesController';
import ConnectionsController from './controllers/ConnectionsController';
import ForgotPasswordController from './controllers/ForgotPasswordController';
import ResetPasswordController from './controllers/ResetPasswordController';
import UsersController from './controllers/UsersController';
import SessionsController from './controllers/SessionsController';
import userIdValidator from './validator/userIdValidator';
import classFiltersValidator from './validator/classFiltersValidator';
import classValidator from './validator/classValidator';
import forgotPasswordValidator from './validator/forgotPasswordValidator';
import userValidator from './validator/userValidator';
import resetPasswordValidator from './validator/resetPasswordValidator';
import sessionValidator from './validator/sessionValidator';
import Auth from './middlewares/Auth';
import FavoritesController from './controllers/FavoritesController';
import favoritedValidator from './validator/favoritedValidator';
import idValidator from './validator/idValidator';

const classesController = new ClassesController();
const connectionsController = new ConnectionsController();
const forgotPasswordController = new ForgotPasswordController();
const resetPasswordController = new ResetPasswordController();
const sessionsController = new SessionsController();
const usersController = new UsersController();
const favoritesController = new FavoritesController();
const routes = express.Router();

routes.post('/sessions', sessionValidator, sessionsController.store);

routes.get('/connections', connectionsController.index);
routes.post('/connections', userIdValidator, connectionsController.store);

routes.post('/users', userValidator, usersController.store);
routes.post(
  '/users/forgot_password',
  forgotPasswordValidator,
  forgotPasswordController.store,
);
routes.post(
  '/users/reset_password',
  resetPasswordValidator,
  resetPasswordController.store,
);

routes.use(Auth);

routes.get('/users/:id', idValidator, usersController.show);

routes.get('/classes', classFiltersValidator, classesController.index);
routes.get('/classes/:id', idValidator, classesController.show);
routes.post('/classes', classValidator, classesController.store);

routes.post('/favorites', favoritedValidator, favoritesController.store);
export default routes;
