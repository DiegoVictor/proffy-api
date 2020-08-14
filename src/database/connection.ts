import knex from 'knex';
import config from '../../knexfile';

const db = knex(
  (() => {
    if (process.env?.NODE_ENV) {
      return config[process.env.NODE_ENV];
    }

    const key: string | undefined = Object.keys(config).shift();
    if (!key) {
      throw new Error('Knex configuration not found');
    }

    return config[key];
  })(),
);

export default db;
