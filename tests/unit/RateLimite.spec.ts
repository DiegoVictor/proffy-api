import request from 'supertest';

import app from '../../src/app';
import connection from '../../src/database/sql';
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

describe('RateLimit', () => {
  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should not be able to consume after many requests', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await connection('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;
    const requests = [
      request(app).get('/v1/').set('Authorization', authorization),
    ];

    Array.from(Array(20).keys()).forEach(() => {
      requests.push(
        request(app).get('/v1/').set('Authorization', authorization),
      );
    });

    const responses = await Promise.all(requests);

    expect(responses.pop()?.body).toStrictEqual({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Too Many Requests',
      code: 529,
      docs: process.env.DOCS_URL,
    });
  });
});
