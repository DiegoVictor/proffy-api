import { Request, Response } from 'express';

import { db } from '../database/sql';

export class ConnectionsController {
  async index(_: Request, response: Response): Promise<Response> {
    const [{ total }] = await db('connections').count('* as total');
    return response.json({ total });
  }

  async store(request: Request, response: Response): Promise<Response> {
    const { user_id } = request.body;

    await db('connections').insert({ user_id });

    return response.sendStatus(204);
  }
}
