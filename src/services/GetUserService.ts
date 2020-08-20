import { notFound } from '@hapi/boom';
import db from '../database/connection';

interface Request {
  id: string;
}

interface User {
  id: number;
  class_id: number;
  whatsapp: string;
  name: string;
  surname: string;
  bio: string;
  avatar: string;
  subject: string;
  cost: number;
  week_day: number;
  from: string;
  to: string;
}

interface SerializedClass {
  id: number;
  class_id?: number;
  whatsapp: string;
  name: string;
  surname: string;
  bio: string;
  avatar: string;
  subject: string;
  cost: number;
  schedules: {
    week_day: number;
    from: string;
    to: string;
  }[];
}

class GetUserService {
  public async execute({ id }: Request): Promise<SerializedClass> {
    const user: User = await db('users')
      .join('classes', 'users.id', '=', 'classes.user_id')
      .where('users.id', id)
      .select(
        'users.id',
        'users.name',
        'users.surname',
        'users.email',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
        'classes.id as class_id',
        'classes.subject',
        'classes.cost',
      )
      .first();

    if (!user) {
      throw notFound('User not found', { code: 244 });
    }

    const schedules = await db('class_schedule')
      .where('class_id', user.class_id)
      .select('week_day', 'from', 'to', 'class_id');

    return {
      ...user,
      schedules,
    };
  }
}

export default GetUserService;
