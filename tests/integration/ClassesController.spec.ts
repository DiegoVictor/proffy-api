import request from 'supertest';
import { faker } from '@faker-js/faker';

import { db } from '../../src/database/sql';
import factory from '../utils/factory';
import app from '../../src/app';
import token from '../utils/jwtoken';

interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

interface Class {
  id: number;
  user_id?: number;
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

interface ClassSchedule {
  id: number;
  week_day: number;
  from: number;
  to: number;
  class_id: number;
}

describe('ClassesController', () => {
  const url = `http://127.0.0.1:${process.env.APP_PORT}/v1`;

  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should be able to get a page of classes', async () => {
    const week_day = 0;
    const subject = 'Matemátia';
    const classesCount = 15;

    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classes = await factory.attrsMany<Class>(
      'Class',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        user_id,
        subject,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        from: 480,
        to: 920,
        week_day,
      })),
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get(`/v1/classes?week_day=${week_day}&subject=${subject}&time=9:00`)
      .set('Authorization', authorization);

    const savedClasses = await db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .where('classes.subject', '=', subject)
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [week_day])
          .whereRaw('`class_schedule`.`from` <= ??', [540])
          .whereRaw('`class_schedule`.`to` > ??', [540]);
      })
      .limit(10)
      .select(
        'classes.id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedClasses.map(classItem => classItem.id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const classesSerialized = savedClasses.map(classItem => {
      return {
        ...classItem,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === classItem.id,
        ),
      };
    });

    classesSerialized.forEach(classItem => {
      expect(response.body).toContainEqual({
        ...classItem,
        url: `${url}/classes/${classItem.id}`,
        user_url: `${url}/users/${user_id}`,
      });
    });
  });

  it('should be able to get the second page of classes', async () => {
    const week_day = 0;
    const subject = 'Matemátia';
    const classesCount = 15;

    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classes = await factory.attrsMany<Class>(
      'Class',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        user_id,
        subject,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        from: 480,
        to: 920,
        week_day,
      })),
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get(
        `/v1/classes?week_day=${week_day}&subject=${subject}&time=9:00&page=2`,
      )
      .set('Authorization', authorization);

    const savedClasses = await db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .where('classes.subject', '=', subject)
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [week_day])
          .whereRaw('`class_schedule`.`from` <= ??', [540])
          .whereRaw('`class_schedule`.`to` > ??', [540]);
      })
      .limit(10)
      .offset(10)
      .select(
        'classes.id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedClasses.map(classItem => classItem.id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const classesSerialized = savedClasses.map(classItem => {
      return {
        ...classItem,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === classItem.id,
        ),
      };
    });

    classesSerialized.forEach(classItem => {
      expect(response.body).toContainEqual({
        ...classItem,
        url: `${url}/classes/${classItem.id}`,
        user_url: `${url}/users/${user_id}`,
      });
    });
  });

  it('should be able to get all classes', async () => {
    const week_day = 0;
    const subject = 'Matemátia';
    const classesCount = 5;

    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classes = await factory.attrsMany<Class>(
      'Class',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        user_id,
        subject,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        from: 480,
        to: 920,
        week_day,
      })),
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get(`/v1/classes?week_day=${week_day}&subject=${subject}`)
      .set('Authorization', authorization);

    const savedClasses = await db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .where('classes.subject', '=', subject)
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
          .whereRaw('`class_schedule`.`week_day` = ??', [week_day]);
      })
      .limit(10)
      .select(
        'classes.id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedClasses.map(classItem => classItem.id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const classesSerialized = savedClasses.map(classItem => {
      return {
        ...classItem,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === classItem.id,
        ),
      };
    });

    classesSerialized.forEach(classItem => {
      expect(response.body).toContainEqual({
        ...classItem,
        url: `${url}/classes/${classItem.id}`,
        user_url: `${url}/users/${user_id}`,
      });
    });
  });

  it('should be able to get all classes without filters', async () => {
    const week_day = 0;
    const subject = 'Matemátia';
    const classesCount = 5;

    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classes = await factory.attrsMany<Class>(
      'Class',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        user_id,
        subject,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      classesCount,
      Array.from(Array(classesCount).keys()).map(() => ({
        from: 480,
        to: 920,
        week_day,
      })),
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get(`/v1/classes`)
      .set('Authorization', authorization);

    const savedClasses = await db('classes')
      .join('users', 'classes.user_id', '=', 'users.id')
      .limit(10)
      .select(
        'classes.id',
        'classes.subject',
        'classes.cost',
        'users.id as user_id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedClasses.map(classItem => classItem.id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const classesSerialized = savedClasses.map(classItem => {
      return {
        ...classItem,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === classItem.id,
        ),
      };
    });

    classesSerialized.forEach(classItem => {
      expect(response.body).toContainEqual({
        ...classItem,
        url: `${url}/classes/${classItem.id}`,
        user_url: `${url}/users/${user_id}`,
      });
    });
  });

  it('should be able to create new class', async () => {
    const subject = 'Matemática';
    const cost = faker.datatype.number();
    const schedules = [
      {
        week_day: 0,
        from: '6:00',
        to: '12:00',
      },
    ];
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    await request(app)
      .post(`/v1/classes`)
      .set('Authorization', authorization)
      .send({
        user_id,
        subject,
        bio: faker.lorem.paragraph(),
        whatsapp: user.whatsapp,
        cost,
        schedules,
      });

    const classItem = await db('classes').where('user_id', user_id).first();
    expect(classItem).toMatchObject({
      id: expect.any(Number),
      subject,
      cost,
    });

    const classSchedule = await db('class_schedule')
      .where('class_id', classItem.id)
      .first();
    expect(classSchedule).toMatchObject({
      id: expect.any(Number),
      week_day: 0,
      from: 360,
      to: 720,
    });
  });

  it('should be able to update a class', async () => {
    const subject = faker.lorem.word();
    const schedules = [
      {
        week_day: 0,
        from: '6:00',
        to: '12:00',
      },
    ];
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classItem = await factory.attrs<Class>('Class', { user_id });
    const [class_id] = await db('classes').insert(classItem);
    const cost = classItem.cost + 1;

    await request(app)
      .post(`/v1/classes`)
      .set('Authorization', authorization)
      .send({
        user_id,
        subject,
        bio: faker.lorem.paragraph(),
        whatsapp: user.whatsapp,
        cost,
        schedules,
      });

    const updateClass = await db('classes').where('id', class_id).first();
    expect(updateClass).toMatchObject({
      id: expect.any(Number),
      subject,
      cost,
    });

    const classSchedule = await db('class_schedule')
      .where('class_id', class_id)
      .first();
    expect(classSchedule).toMatchObject({
      id: expect.any(Number),
      week_day: 0,
      from: 360,
      to: 720,
    });
  });

  it('should be able to update a class with another subject', async () => {
    const subject = faker.lorem.word();
    const schedules = [
      {
        week_day: 0,
        from: '6:00',
        to: '12:00',
      },
    ];
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classItem = await factory.attrs<Class>('Class', { user_id });
    const [class_id] = await db('classes').insert(classItem);

    await request(app)
      .post(`/v1/classes`)
      .set('Authorization', authorization)
      .send({
        user_id,
        subject,
        bio: faker.lorem.paragraph(),
        whatsapp: user.whatsapp,
        cost: classItem.cost,
        schedules,
      });

    const updateClass = await db('classes').where('id', class_id).first();
    expect(updateClass).toMatchObject({
      id: expect.any(Number),
      subject,
      cost: classItem.cost,
    });

    const classSchedule = await db('class_schedule')
      .where('class_id', class_id)
      .first();
    expect(classSchedule).toMatchObject({
      id: expect.any(Number),
      week_day: 0,
      from: 360,
      to: 720,
    });
  });

  it('should be able to update a class with the same cost and subject', async () => {
    const schedules = [
      {
        week_day: 0,
        from: '6:00',
        to: '12:00',
      },
    ];
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const classItem = await factory.attrs<Class>('Class', { user_id });
    const [class_id] = await db('classes').insert(classItem);
    const { subject, cost } = classItem;

    await request(app)
      .post(`/v1/classes`)
      .set('Authorization', authorization)
      .send({
        user_id,
        subject,
        bio: faker.lorem.paragraph(),
        whatsapp: user.whatsapp,
        cost,
        schedules,
      });

    const updateClass = await db('classes').where('id', class_id).first();
    expect(updateClass).toMatchObject({
      id: expect.any(Number),
      subject,
      cost: classItem.cost,
    });

    const classSchedule = await db('class_schedule')
      .where('class_id', class_id)
      .first();
    expect(classSchedule).toMatchObject({
      id: expect.any(Number),
      week_day: 0,
      from: 360,
      to: 720,
    });
  });

  it('should be able to retrieve a class', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);

    const classItem = await factory.attrs<Class>('Class', {
      user_id,
    });
    const [class_id] = await db('classes').insert(classItem);

    const schedules = await factory.attrs<ClassSchedule>('ClassSchedule', {
      class_id,
    });
    await db('class_schedule').insert(schedules);

    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .get(`/v1/classes/${class_id}`)
      .set('Authorization', authorization)
      .send();

    delete user.password;
    delete classItem.user_id;
    expect(response.body).toEqual({
      ...user,
      ...classItem,
      id: expect.any(Number),
      user_id,
      schedules: [schedules],
      url: `${url}/classes/${class_id}`,
      user_url: `${url}/users/${user_id}`,
    });
  });

  it('should not be able to retrieve a class that not exists', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const class_id = faker.datatype.number();

    const response = await request(app)
      .get(`/v1/classes/${class_id}`)
      .set('Authorization', authorization)
      .expect(404)
      .send();

    expect(response.body).toStrictEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'Class not found',
      code: 144,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to create new class', async () => {
    const subject = 'Matemática';
    const cost = faker.datatype.number();
    const schedules = [
      {
        week_day: 0,
        from: 'invalid-hour',
        to: 'invalid-hour',
      },
    ];
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);

    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .post(`/v1/classes`)
      .set('Authorization', authorization)
      .expect(500)
      .send({
        user_id,
        subject,
        cost,
        schedules,
        bio: user.bio,
        whatsapp: user.whatsapp,
      });

    const [classesCount] = await db('classes').count();
    const [classScheduleCount] = await db('class_schedule').count();

    expect(classesCount['count(*)']).toBe(0);
    expect(classScheduleCount['count(*)']).toBe(0);
    expect(response.body).toStrictEqual({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An internal server error occurred',
      code: 150,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to create new class with an user that not exists', async () => {
    const subject = 'Matemática';
    const cost = faker.datatype.number();
    const schedules = [
      {
        week_day: 0,
        from: '8:00',
        to: '13:00',
      },
    ];
    const user_id = faker.datatype.number();
    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .post(`/v1/classes`)
      .set('Authorization', authorization)
      .expect(404)
      .send({
        user_id,
        subject,
        cost,
        schedules,
        bio: faker.lorem.paragraph(),
        whatsapp: faker.phone.number(),
      });

    const [classesCount] = await db('classes').count();
    const [classScheduleCount] = await db('class_schedule').count();

    expect(classesCount['count(*)']).toBe(0);
    expect(classScheduleCount['count(*)']).toBe(0);
    expect(response.body).toStrictEqual({
      statusCode: 404,
      error: 'Not Found',
      message: 'User not found',
      code: 141,
      docs: process.env.DOCS_URL,
    });
  });
});
