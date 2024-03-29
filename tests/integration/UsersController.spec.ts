import request from 'supertest';
import { faker } from '@faker-js/faker';

import { db } from '../../src/database/sql';
import app from '../../src/app';
import factory from '../utils/factory';
import token from '../utils/jwtoken';

interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  password?: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

interface ClassItem {
  id: number;
  subject: string;
  cost: number;
  user_id?: number;
}

interface ClassSchedule {
  id: number;
  week_day: number;
  from: number;
  to: number;
  class_id: number;
}

describe('UsersController', () => {
  const url = `http://127.0.0.1:${process.env.APP_PORT}/v1`;

  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should be able to store a new user', async () => {
    const user = await factory.attrs<User>('User');
    await request(app).post('/v1/users').expect(201).send(user);

    const savedUser = await db('users')
      .select('email', 'name', 'surname', 'avatar', 'whatsapp', 'bio')
      .first();

    delete user.password;
    expect(savedUser).toEqual(user);
  });

  it('should be able to retrieve an user', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);

    const classItem = await factory.attrs<ClassItem>('Class', { user_id });
    const [class_id] = await db('classes').insert(classItem);

    const schedules = await factory.attrs<ClassSchedule>('ClassSchedule', {
      class_id,
    });
    await db('class_schedule').insert(schedules);

    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .get(`/v1/users/${user_id}`)
      .set('Authorization', authorization)
      .send();

    delete user.password;
    delete classItem.user_id;
    expect(response.body).toEqual({
      ...user,
      ...classItem,
      id: user_id,
      class_id,
      schedules: [schedules],
      url: `${url}/users/${user_id}`,
      class_url: `${url}/classes/${class_id}`,
    });
  });

  it('should not be able to retrieve an user that not exists', async () => {
    const user_id = faker.number.int();
    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .get(`/v1/users/${user_id}`)
      .set('Authorization', authorization)
      .expect(404)
      .send();

    expect(response.body).toStrictEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
      code: 244,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to store a new user with a duplicated email', async () => {
    const user = await factory.attrs<User>('User');
    await db('users').insert(user);

    const response = await request(app)
      .post('/v1/users')
      .expect(400)
      .send(user);

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Email already in use',
      code: 240,
      docs: process.env.DOCS_URL,
    });
  });

  it('should be able to update a user', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);

    const authorization = `Bearer ${token(user_id)}`;

    const { name, surname, avatar, whatsapp, bio } =
      await factory.attrs<User>('User');
    await request(app)
      .put('/v1/users')
      .set('Authorization', authorization)
      .expect(204)
      .send({ name, surname, avatar, whatsapp, bio });

    const updatedUser = await db('users')
      .select('name', 'surname', 'avatar', 'whatsapp', 'bio')
      .first();

    expect(updatedUser).toEqual({ name, surname, avatar, whatsapp, bio });
  });

  it('should not be able to update a user that not exists', async () => {
    const user_id = faker.number.int();
    const authorization = `Bearer ${token(user_id)}`;

    const { name, surname, avatar, whatsapp, bio } =
      await factory.attrs<User>('User');
    const response = await request(app)
      .put('/v1/users')
      .set('Authorization', authorization)
      .expect(404)
      .send({ name, surname, avatar, whatsapp, bio });

    expect(response.body).toEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
      code: 244,
      docs: process.env.DOCS_URL,
    });
  });
});
