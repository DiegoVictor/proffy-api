import request from 'supertest';
import { faker } from '@faker-js/faker';

import app from '../../src/app';

describe('Auth middleware', () => {
  it('should not be able to be authorized without token', async () => {
    const response = await request(app).get('/v1/');

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Token not provided',
      code: 543,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to be authorized with invalid token', async () => {
    const authorization = faker.string.alphanumeric(16);
    const response = await request(app)
      .get('/v1/')
      .set('Authorization', authorization);

    expect(response.body).toStrictEqual({
      attributes: {
        code: 541,
        error: 'Token invalid or expired',
      },
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Token invalid or expired',
      docs: process.env.DOCS_URL,
    });
  });
});
