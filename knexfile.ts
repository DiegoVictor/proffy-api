import path from 'path';

interface DatabaseConfiguration {
  client: string;
  connection: {
    filename: string;
  };
  migrations: {
    directory: string;
  };
  useNullAsDefault: true;
}

interface DatabaseConfigurationGroup {
  [key: string]: DatabaseConfiguration;
}

const configurations: DatabaseConfigurationGroup = {
  test: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, 'src', 'database', 'tests.sqlite'),
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
    },
    useNullAsDefault: true,
  },
  development: {
    client: 'sqlite3',
    connection: {
      filename: path.resolve(__dirname, 'src', 'database', 'database.sqlite'),
    },
    migrations: {
      directory: path.resolve(__dirname, 'src', 'database', 'migrations'),
    },
    useNullAsDefault: true,
  },
};

export default configurations;
