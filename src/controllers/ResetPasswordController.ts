import { Request, Response } from 'express';

import { ResetPasswordService } from '../services/ResetPasswordService';

export class ResetPasswordController {
  public async store(request: Request, response: Response): Promise<Response> {
    const { password, token } = request.body;

    const resetPassoword = new ResetPasswordService();
    await resetPassoword.execute({
      password,
      token,
    });

    return response.sendStatus(204);
  }
}
