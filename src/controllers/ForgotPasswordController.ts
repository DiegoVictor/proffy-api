import { Request, Response } from 'express';

import { SendForgotPasswordEmailService } from '../services/SendForgotPasswordEmailService';

export class ForgotPasswordController {
  public async store(request: Request, response: Response): Promise<Response> {
    const { email } = request.body;

    const sendForgotPasswordEmail = new SendForgotPasswordEmailService();
    await sendForgotPasswordEmail.execute({
      email,
    });

    return response.sendStatus(204);
  }
}
