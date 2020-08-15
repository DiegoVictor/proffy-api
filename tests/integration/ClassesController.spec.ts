import request from 'supertest';
import faker from 'faker';

import connection from '../../src/database/connection';
import factory from '../utils/factory';
import app from '../../src/app';
import ClassesRepository from '../../src/repositories/ClassesRepository';

interface User {
  id: number;
  name: string;
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

describe('ClassesController', () => {
  beforeEach(async () => {
    await connection.migrate.rollback();
    await connection.migrate.latest();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  it('should be able to get a list of classes', async () => {
    const week_day = 0;
    const subject = 'Matemátia';
    const length = 15;

    const user = await factory.attrs<User>('User');
    const classes = await factory.attrsMany<ClassItem>(
      'Class',
      length,
      new Array(length).fill({
        user_id: user.id,
        subject,
      }),
    );
    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      length,
      classes.map((classItem: ClassItem) => ({
        class_id: classItem.id,
        week_day,
        from: 6 * 60,
        to: 12 * 60,
      })),
    );

    await connection('users').insert(user);
    await connection('classes').insert(classes);
    await connection('class_schedule').insert(schedules);

    const response = await request(app).get(
      `/v1/classes?week_day=${week_day}&subject=${subject}&time=9:00`,
    );

    const classesRepository = new ClassesRepository();

    const savedClasses: ClassItem[] = await classesRepository
      .getQueryBySubjectInWeekDayAtTime(subject, week_day, 9 * 60)
      .limit(10)
      .select(['users.*', 'classes.*']);

    savedClasses.forEach(classItem => {
      expect(response.body).toContainEqual({ ...classItem, ...user });
    });
  });

  it('should be able to create new class', async () => {
    const subject = 'Matemática';
    const cost = faker.random.number();
    const schedule = [
      {
        week_day: 0,
        from: '6:00',
        to: '12:00',
      },
    ];
    const { name, avatar, whatsapp, bio } = await factory.attrs<User>('User');
    await request(app).post(`/v1/classes`).expect(201).send({
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    });

    const user = await connection('users').first();
    expect(user).toMatchObject({
      id: expect.any(Number),
      name,
      avatar,
      whatsapp,
      bio,
    });

    const classItem = await connection('classes')
      .where('user_id', user.id)
      .first();
    expect(classItem).toMatchObject({
      id: expect.any(Number),
      subject,
      cost,
    });

    const classSchedule = await connection('class_schedule')
      .where('class_id', classItem.id)
      .first();
    expect(classSchedule).toMatchObject({
      id: expect.any(Number),
      week_day: 0,
      from: 360,
      to: 720,
    });
  });

  it('should not be able to create new class', async () => {
    const subject = 'Matemática';
    const cost = faker.random.number();
    const schedule = [
      {
        week_day: 0,
        from: 'invalid-hour',
        to: 'invalid-hour',
      },
    ];
    const { name, avatar, whatsapp, bio } = await factory.attrs<User>('User');
    const response = await request(app).post(`/v1/classes`).expect(500).send({
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    });

    const [usersCount] = await connection('users').count();
    const [classesCount] = await connection('classes').count();
    const [classScheduleCount] = await connection('class_schedule').count();

    expect(usersCount['count(*)']).toBe(0);
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
});
