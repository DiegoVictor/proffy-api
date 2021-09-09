import request from 'supertest';
import faker from 'faker';

import connection from '../../src/database/sql';
import app from '../../src/app';
import factory from '../utils/factory';
import token from '../utils/jwtoken';

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

interface ClassItem {
  id: number;
  subject: string;
  cost: number;
  user_id: number;
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
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to store a new user', async () => {
    const user = await factory.attrs<User>('User');
    await request(app).post('/v1/users').expect(201).send(user);

    const savedUser = await connection('users')
      .select('email', 'name', 'surname', 'avatar', 'whatsapp', 'bio')
      .first();

    delete user.password;
    expect(savedUser).toEqual(user);
  });

  it('should be able to retrieve an user', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await connection('users').insert(user);

    const classItem = await factory.attrs<ClassItem>('Class', { user_id });
    const [class_id] = await connection('classes').insert(classItem);

    const schedules = await factory.attrs<ClassSchedule>('ClassSchedule', {
      class_id,
    });
    await connection('class_schedule').insert(schedules);

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
    const user_id = faker.random.number();
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
    await connection('users').insert(user);

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
});
