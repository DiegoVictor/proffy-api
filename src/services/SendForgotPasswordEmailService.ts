import jwt from 'jsonwebtoken';
import { badRequest } from '@hapi/boom';

import { db } from '../database/sql';

interface Request {
  email: string;
}

class SendForgotPasswordEmailService {
  public async execute({ email }: Request): Promise<void> {
    const user = await db('users').where('email', email).first();

    if (!user) {
      throw badRequest('User does not exists', { code: 544 });
    }

    const token = jwt.sign({ id: user.id }, auth.secret, {
      expiresIn: '1d',
    });

    const mailProvider = new MailProvider();
    await mailProvider.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: '[Proffy] Recuperação de senha',
      html: `
        Olá ${user.name},<br>
        <br>
        Para atualizar sua senha acesse: ${process.env.APP_WEB_URL}/reset-password?token=${token}
      `,
    });
  }
}

export default SendForgotPasswordEmailService;
