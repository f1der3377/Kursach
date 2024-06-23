/**
 * Класс для работы с БД
 */

import pgpromise from 'pg-promise';

import {
  UserModel,
  TypeServiceModel,
  ServiceModel,
  StaffModel,
  BonusCardModel,
  ClientModel,
  StatusOrderModel,
  OrderModel,

  StaffServiceModel,

  ServicesVW,
  OrderVW,
  ReportEmploymentStaffVW,
  ReportOrdersStaffVW,
  ReportOrdersVW,
  ReportVolumeWorkStaffVW,
} from './index.js';

class DataBase {
  db = null;

  constructor() {
    const pgp = pgpromise();
    this.db = pgp({
      host: process.env.PG_HOST,
      port: 5432,
      database: process.env.PG_DATABASE,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD
    });
  }

  async initConnect() {
    await this.db.connect();
  }

  async createTables() {
    await (new UserModel()).createTable();
    await (new TypeServiceModel()).createTable();
    await (new ServiceModel()).createTable();
    await (new StaffModel()).createTable();
    await (new BonusCardModel()).createTable();
    await (new ClientModel()).createTable();
    await (new StatusOrderModel()).createTable();
    await (new OrderModel()).createTable();

    await (new StaffServiceModel()).createTable();
  }

  async createVW() {
    await (new ServicesVW()).createView();
    await (new OrderVW()).createView();
    await (new ReportEmploymentStaffVW()).createView();
    await (new ReportOrdersStaffVW()).createView();
    await (new ReportOrdersVW()).createView();
    await (new ReportVolumeWorkStaffVW()).createView();
  }
}

export default DataBase;