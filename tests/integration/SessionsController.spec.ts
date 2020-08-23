import request from 'supertest';
import faker from 'faker';
import { hash } from 'bcryptjs';

import app from '../../src/app';
import connection from '../../src/database/sql';
import factory from '../utils/factory';

interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  password: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

describe('SessionsController', () => {
  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to login', async () => {
    const password = faker.internet.password();
    const user = await factory.attrs<User>('User', {
      password: await hash(password, 8),
    });

    const [user_id] = await connection('users').insert(user);

    const response = await request(app)
      .post('/v1/sessions')
      .send({ email: user.email, password });

    expect(response.body).toStrictEqual({
      user: { id: user_id, name: user.name, email: user.email },
      token: expect.any(String),
    });
  });

  it('should not be able to login with wrong password', async () => {
    const password = faker.internet.password();
    const user = await factory.attrs<User>('User');

    await connection('users').insert(user);

    const response = await request(app)
      .post('/v1/sessions')
      .expect(400)
      .send({ email: user.email, password });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'User and/or password not match',
      code: 340,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to login with an user that not exists', async () => {
    const email = faker.internet.email();
    const password = faker.internet.password();

    const response = await request(app)
      .post('/v1/sessions')
      .expect(400)
      .send({ email, password });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'User not exists',
      code: 344,
      docs: process.env.DOCS_URL,
    });
  });
});
