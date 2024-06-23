/**
 * Модель "Статус заказа"
 */

import BaseModel from "./BaseModel.js";

class StatusOrderModel extends BaseModel {
  tableName = 'status_order';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (name) VALUES($1) RETURNING id`, [data.name]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL
        );
      `);

      await this.create({ name: 'Активна' });
      await this.create({ name: 'Отменена' });
      await this.create({ name: 'Выполнена' });
    }
  }
}

export default StatusOrderModel;