import {DataSource} from 'typeorm';
import {config} from '../lib/config';
import {StickyMessage} from './entities/StickyMessage';

export const AppDataSource = new DataSource({
  type: 'mariadb',
  host: config.MARIADB_HOST,
  port: Number(config.MARIADB_PORT),
  username: config.MARIADB_USER,
  password: config.MARIADB_PASSWORD,
  database: config.MARIADB_DATABASE,
  entities: [StickyMessage],
  synchronize: true,
  logging: false,
})