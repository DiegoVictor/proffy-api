import request from 'supertest';
import { faker } from '@faker-js/faker';

import connection from '../../src/database/sql';
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

describe('ConnectionsController', () => {
  let user: User;
  let authorization: string;

  beforeAll(async () => {
    user = await factory.attrs<User>('User');
    const [user_id] = await connection('users').insert(user);
    authorization = `Bearer ${token(user_id)}`;
  });

  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to get total of connections', async () => {
    const total = 10;
    const connections = await factory.attrsMany('Connection', total);

    await connection('connections').insert(connections);

    const response = await request(app)
      .get('/v1/connections')
      .set('Authorization', authorization);

    expect(response.body).toStrictEqual({ total });
  });

  it('should be able to count a new connection', async () => {
    await request(app)
      .post('/v1/connections')
      .expect(204)
      .set('Authorization', authorization)
      .send({ user_id: faker.random.number() });

    const [connectionsCount] = await connection('connections').count();
    expect(connectionsCount['count(*)']).toBe(1);
  });
});
