/**
 * Модель "Виды Услуги"
 */

import BaseModel from "./BaseModel.js";

class TypeServiceModel extends BaseModel {
  tableName = 'type_service';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (name) VALUES($1) RETURNING id`, [ data.name ]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL
        );
      `);

      await this.create({ name: 'Ноготочки' });
      await this.create({ name: 'Массаж' });
      await this.create({ name: 'Работа с волосами' });
    }
  }
}

export default TypeServiceModel;