import {
  ConnectionOptions,
  Connection,
  createConnection,
  getConnection,
} from "typeorm";

import "reflect-metadata";

export const prod = process.env.NODE_ENV === "production";

export const config: ConnectionOptions = {
  name: "fun",
  type: "mysql",
  host: "127.0.0.1",
  port: 3306,
  username: "root",
  password: "123",
  database: "bikes",
  synchronize: true,
  logging: false,
  entities: [
    "lib/entity/**/*.js",
  ],

  ...(prod && {
    ip: "34.151.216.235",
    logging: false,
    extra: {
      socketPath: "/cloudsql/bikes-359120:southamerica-east1:roscosoft",
    },
  }),
};

export const connect = async () => {
  let connection: Connection;

  try {
    connection = getConnection(config.name);
  } catch (err) {
    connection = await createConnection(config);
  }

  return connection;
};
