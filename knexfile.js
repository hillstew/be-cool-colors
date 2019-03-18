module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/cool_colors',
    useNullAsDefault: true,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds/dev'
    }
  }
};
