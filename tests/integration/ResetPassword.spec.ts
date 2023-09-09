import request from 'supertest';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

import { db } from '../../src/database/sql';
import factory from '../utils/factory';
import app from '../../src/app';
import token from '../utils/jwtoken';

interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

describe('ResetController', () => {
  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should be able to update user password', async () => {
    const password = faker.string.alphanumeric(16);
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);

    const resetPasswordToken = token(user_id);

    await request(app).post('/v1/users/reset_password').expect(204).send({
      password,
      password_confirmation: password,
      token: resetPasswordToken,
    });

    const updatedUser = await db('users')
      .where('id', user_id)
      .select('password')
      .first();

    expect(bcrypt.compare(password, updatedUser.password)).toBeTruthy();
  });

  it('should not be able to update user password with invalid token', async () => {
    const password = faker.string.alphanumeric(16);
    const resetPasswordToken = faker.string.alphanumeric(40);

    const response = await request(app)
      .post('/v1/users/reset_password')
      .expect(400)
      .send({
        password,
        password_confirmation: password,
        token: resetPasswordToken,
      });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Token invalid or expired',
      code: 540,
      docs: process.env.DOCS_URL,
    });
  });

  it("should not be able to update a invalid user's password", async () => {
    const password = faker.string.alphanumeric(16);
    const resetPasswordToken = token(faker.number.int());

    const response = await request(app)
      .post('/v1/users/reset_password')
      .expect(400)
      .send({
        password,
        password_confirmation: password,
        token: resetPasswordToken,
      });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Invalid token',
      code: 542,
      docs: process.env.DOCS_URL,
    });
  });

  it('should be not able to update user password', async () => {
    const password = faker.string.alphanumeric(16);
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);

    const resetPasswordToken = token(user_id);

    jest.spyOn(bcrypt, 'hash').mockImplementation(() => {
      throw Error();
    });

    const response = await request(app)
      .post('/v1/users/reset_password')
      .expect(500)
      .send({
        password,
        password_confirmation: password,
        token: resetPasswordToken,
      });

    expect(response.body).toStrictEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
      code: 550,
      docs: process.env.DOCS_URL,
    });
  });
});
