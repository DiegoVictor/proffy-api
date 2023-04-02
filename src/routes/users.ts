import { Router } from 'express';

import { ForgotPasswordController } from '../controllers/ForgotPasswordController';
import { ResetPasswordController } from '../controllers/ResetPasswordController';
import { UsersController } from '../controllers/UsersController';
import forgotPasswordValidator from '../validators/forgotPasswordValidator';
import userValidator, {
  updateUserValidator,
} from '../validators/userValidator';
import resetPasswordValidator from '../validators/resetPasswordValidator';
import idValidator from '../validators/idValidator';
import Auth from '../middlewares/Auth';

const usersController = new UsersController();
const forgotPasswordController = new ForgotPasswordController();
const resetPasswordController = new ResetPasswordController();

const app = Router();

app.post('/', userValidator, usersController.store);
app.post(
  '/forgot_password',
  forgotPasswordValidator,
  forgotPasswordController.store,
);
app.post(
  '/reset_password',
  resetPasswordValidator,
  resetPasswordController.store,
);

app.use(Auth);

app.get('/:id', idValidator, usersController.show);
app.put('/', updateUserValidator, usersController.update);

export default app;
