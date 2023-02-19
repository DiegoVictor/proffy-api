import request from 'supertest';
import { faker } from '@faker-js/faker';

import { db } from '../../src/database/sql';
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
    await db.migrate.rollback();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should be able to start forgot password process', async () => {
    const user = await factory.attrs<User>('User');
    await db('users').insert(user);

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

  it('should not be able to start forgot password process with am user that not exists', async () => {
    const email = faker.internet.email();

    const response = await request(app)
      .post('/v1/users/forgot_password')
      .expect(400)
      .send({ email });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'User does not exists',
      code: 544,
      docs: process.env.DOCS_URL,
    });
  });
});
