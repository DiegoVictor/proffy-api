import request from 'supertest';

import connection from '../../src/database/connection';
import factory from '../utils/factory';
import app from '../../src/app';

interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

const sendMail = jest.fn();
jest.mock('nodemailer', () => ({
  createTransport: () => ({ sendMail }),
}));

describe('ForgotPasswordController', () => {
  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to start forgot password process', async () => {
    const user = await factory.attrs<User>('User');
    await connection('users').insert(user);

    await request(app)
      .post('/v1/users/forgot_password')
      .expect(204)
      .send({ email: user.email });

    expect(sendMail).toHaveBeenCalledWith({
      from: {
        name: 'Equipe Proffy',
        address: 'noreply@proffy.com.br',
      },
      to: { name: user.name, address: user.email },
      subject: '[Proffy] Recuperação de senha',
      html: expect.any(String),
    });
  });
});
