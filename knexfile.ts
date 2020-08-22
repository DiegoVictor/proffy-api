import path from 'path';

const config = {
  client: 'sqlite3',
  connection: {
    filename: path.resolve(
      __dirname,
      'src',
      'database',
      `${process.env.NODE_ENV || 'development'}.sqlite`,
    ),
  },
  migrations: {
    directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
  },
  useNullAsDefault: true,
};

module.exports = config;
export default config;
