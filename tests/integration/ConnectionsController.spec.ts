import request from 'supertest';
import faker from 'faker';

import connection from '../../src/database/connection';
import factory from '../utils/factory';
import app from '../../src/app';

describe('ConnectionsController', () => {
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

    const response = await request(app).get('/v1/connections');

    expect(response.body).toStrictEqual({ total });
  });

  it('should be able to count a new connection', async () => {
    await request(app)
      .post('/v1/connections')
      .expect(201)
      .send({ user_id: faker.random.number() });

    const [connectionsCount] = await connection('connections').count();
    expect(connectionsCount['count(*)']).toBe(1);
  });
});
