/**
 * Модель "Услуги"
 */

import BaseModel from "./BaseModel.js";

class ServiceModel extends BaseModel {
  tableName = 'services';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (name, type_service_id, price) VALUES($1, $2, $3) RETURNING id`, [data.name, data.type_service_id, data.price]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "type_service_id" int NOT NULL,
          "name" TEXT NOT NULL,
          "price" REAL NOT NULL,
          FOREIGN KEY ("type_service_id") REFERENCES "type_service" ("id") ON DELETE CASCADE
        );
      `);

      await this.create({ name: 'Массаж', type_service_id: 2, price: 500 });
      await this.create({ name: 'Маникюр', type_service_id: 1, price: 1500 });
      await this.create({ name: 'Педикюр', type_service_id: 1, price: 2000 });
      await this.create({ name: 'Окрашивание волос', type_service_id: 3, price: 700 });
      await this.create({ name: 'Стрижка волос', type_service_id: 3, price: 400 });
      await this.create({ name: 'Мелирование', type_service_id: 3, price: 3000 });
    }
  }
}

export default ServiceModel;