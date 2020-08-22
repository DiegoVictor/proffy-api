import request from 'supertest';
import faker from 'faker';
import { hash, compare } from 'bcryptjs';

import connection from '../../src/database/connection';
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
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to update user password', async () => {
    const password = faker.random.alphaNumeric(16);
    const user = await factory.attrs<User>('User');
    const [user_id] = await connection('users').insert(user);

    const resetPasswordToken = token(user_id);

    await request(app).post('/v1/users/reset_password').expect(204).send({
      password,
      password_confirmation: password,
      token: resetPasswordToken,
    });

    const updatedUser = await connection('users')
      .where('id', user_id)
      .select('password')
      .first();

    expect(compare(password, updatedUser.password)).toBeTruthy();
  });
});
