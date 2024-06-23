/**
 * Модель многие ко многим (Мастер <> Услуга)
 */
import BaseModel from "./BaseModel.js";

class StaffServiceModel extends BaseModel {
  tableName = 'staff_service';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (staff_id, service_id) VALUES ($1, $2) RETURNING id`, [data.staff_id, data.service_id]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "staff_id" int NOT NULL,
          "service_id" int NOT NULL,
          FOREIGN KEY ("staff_id") REFERENCES "staff" ("id") ON DELETE CASCADE,
          FOREIGN KEY ("service_id") REFERENCES "services" ("id") ON DELETE CASCADE,
          CONSTRAINT unique_staff_service UNIQUE (staff_id, service_id)
        );
      `);
    }
  }
}

export default StaffServiceModel;