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
  password: string;
  avatar: string;
  whatsapp: string;
  bio: string;
}

interface ClassSchedule {
  id: number;
  week_day: number;
  from: number;
  to: number;
  class_id: number;
}

interface Class {
  id: number;
  user_id: number;
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

describe('FavoritesController', () => {
  const url = `http://127.0.0.1:${process.env.APP_PORT}/v1`;

  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should be able to get a page of favorites', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const favoritesCount = 15;
    const favorites = await factory.attrsMany<User>('User', favoritesCount);

    await db('users').insert(favorites);
    await db('favorites').insert(
      favorites.map((_, index) => ({
        user_id,
        favorited_user_id: index + 2,
      })),
    );

    const classes = await factory.attrsMany<Class>(
      'Class',
      favoritesCount,
      Array.from(Array(favoritesCount).keys()).map((_, index) => ({
        user_id: index + 2,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      favoritesCount,
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get('/v1/favorites')
      .set('Authorization', authorization)
      .send();

    const savedFavorites = await db('favorites')
      .join('users', 'favorites.user_id', '=', 'users.id')
      .join('classes', 'users.id', '=', 'classes.user_id')
      .limit(10)
      .select(
        'favorites.user_id',
        'favorites.favorited_user_id',
        'users.id as id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
        'classes.id as class_id',
        'classes.subject',
        'classes.cost',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedFavorites.map(favorite => favorite.class_id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const favoritesSerialized = savedFavorites.map(favorite => {
      return {
        ...favorite,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === favorite.class_id,
        ),
        user_url: `${url}/v1/users/${favorite.user_id}`,
        class_id: `${url}/v1/classes/${favorite.class_id}`,
      };
    });

    favoritesSerialized.forEach(favorite => {
      expect(response.body).toContainEqual({
        ...favorite,
        url: `${url}/users/${user_id}`,
        favorited_user_url: `${url}/users/${favorite.favorited_user_id}`,
      });
    });
  });

  it('should be able to get the second page of favorites', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const favoritesCount = 15;
    const favorites = await factory.attrsMany<User>('User', favoritesCount);

    await db('users').insert(favorites);
    await db('favorites').insert(
      favorites.map((_, index) => ({
        user_id,
        favorited_user_id: index + 2,
      })),
    );

    const classes = await factory.attrsMany<Class>(
      'Class',
      favoritesCount,
      Array.from(Array(favoritesCount).keys()).map((_, index) => ({
        user_id: index + 2,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      favoritesCount,
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get('/v1/favorites?page=2')
      .set('Authorization', authorization)
      .send();

    const savedFavorites = await db('favorites')
      .join('users', 'favorites.user_id', '=', 'users.id')
      .join('classes', 'users.id', '=', 'classes.user_id')
      .limit(10)
      .offset(10)
      .select(
        'favorites.user_id',
        'favorites.favorited_user_id',
        'users.id as id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
        'classes.id as class_id',
        'classes.subject',
        'classes.cost',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedFavorites.map(favorite => favorite.class_id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const favoritesSerialized = savedFavorites.map(favorite => {
      return {
        ...favorite,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === favorite.class_id,
        ),
        user_url: `${url}/v1/users/${favorite.user_id}`,
        class_id: `${url}/v1/classes/${favorite.class_id}`,
      };
    });

    favoritesSerialized.forEach(favorite => {
      expect(response.body).toContainEqual({
        ...favorite,
        url: `${url}/users/${user_id}`,
        favorited_user_url: `${url}/users/${favorite.favorited_user_id}`,
      });
    });
  });

  it('should be able to get all favorites', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const favoritesCount = 5;
    const favorites = await factory.attrsMany<User>('User', favoritesCount);

    await db('users').insert(favorites);
    await db('favorites').insert(
      favorites.map((_, index) => ({
        user_id,
        favorited_user_id: index + 2,
      })),
    );

    const classes = await factory.attrsMany<Class>(
      'Class',
      favoritesCount,
      Array.from(Array(favoritesCount).keys()).map((_, index) => ({
        user_id: index + 2,
      })),
    );

    await db('classes').insert(classes);

    const schedules = await factory.attrsMany<ClassSchedule>(
      'ClassSchedule',
      favoritesCount,
    );

    await db('class_schedule').insert(
      schedules.map((schedule, index) => ({
        ...schedule,
        class_id: index + 1,
      })),
    );

    const response = await request(app)
      .get('/v1/favorites')
      .set('Authorization', authorization)
      .send();

    const savedFavorites = await db('favorites')
      .join('users', 'favorites.user_id', '=', 'users.id')
      .join('classes', 'users.id', '=', 'classes.user_id')
      .limit(10)
      .select(
        'favorites.user_id',
        'favorites.favorited_user_id',
        'users.id as id',
        'users.name',
        'users.email',
        'users.surname',
        'users.avatar',
        'users.whatsapp',
        'users.bio',
        'classes.id as class_id',
        'classes.subject',
        'classes.cost',
      );

    const savedSchedules = await db('class_schedule')
      .whereIn(
        'class_id',
        savedFavorites.map(favorite => favorite.class_id),
      )
      .select('week_day', 'from', 'to', 'class_id');

    const favoritesSerialized = savedFavorites.map(favorite => {
      return {
        ...favorite,
        schedules: savedSchedules.filter(
          schedule => schedule.class_id === favorite.class_id,
        ),
        user_url: `${url}/v1/users/${favorite.user_id}`,
        class_id: `${url}/v1/classes/${favorite.class_id}`,
      };
    });

    favoritesSerialized.forEach(favorite => {
      expect(response.body).toContainEqual({
        ...favorite,
        url: `${url}/users/${user_id}`,
        favorited_user_url: `${url}/users/${favorite.favorited_user_id}`,
      });
    });
  });

  it('should be able to save as favorite', async () => {
    const [user, favorited_user] = await factory.attrsMany<User>('User', 2);

    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const [favorited_user_id] = await db('users').insert(favorited_user);

    await request(app)
      .post('/v1/favorites')
      .expect(204)
      .set('Authorization', authorization)
      .send({
        user_id: favorited_user_id,
      });

    const favorite = await db('favorites')
      .select('user_id', 'favorited_user_id')
      .first();

    expect(favorite).toEqual({
      user_id,
      favorited_user_id,
    });
  });

  it('should be able to save as favorite an already favorited user', async () => {
    const [user, favorited_user] = await factory.attrsMany<User>('User', 2);

    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const [favorited_user_id] = await db('users').insert(favorited_user);

    await db('favorites').insert({ user_id, favorited_user_id });

    await request(app)
      .post('/v1/favorites')
      .expect(204)
      .set('Authorization', authorization)
      .send({
        user_id: favorited_user_id,
      });
  });

  it('should not be able to save yourself as favorite', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .post('/v1/favorites')
      .expect(400)
      .set('Authorization', authorization)
      .send({
        user_id,
      });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'You can not favorite yourself',
      code: 440,
      docs: process.env.DOCS_URL,
    });
  });

  it('should not be able to save as favorite an user that not exists', async () => {
    const user = await factory.attrs<User>('User');
    const [user_id] = await db('users').insert(user);
    const authorization = `Bearer ${token(user_id)}`;

    const response = await request(app)
      .post('/v1/favorites')
      .expect(400)
      .set('Authorization', authorization)
      .send({
        user_id: faker.number.int(),
      });

    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Users not match',
      code: 444,
      docs: process.env.DOCS_URL,
    });
  });
});
