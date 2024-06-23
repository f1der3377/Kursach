/**
 * Модель "Клиенты"
 */

import BaseModel from "./BaseModel.js";

class ClientModel extends BaseModel {
  tableName = 'clients';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (
      surname,
      name,
      patronymic,
      date_birthday,
      gender,
      phone,
      email,
      bonus_card_id
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8
    ) RETURNING id`, [
      data.surname,
      data.name,
      data.patronymic || null,
      data.date_birthday,
      data.gender,
      data.phone,
      data.email,
      data.bonus_card_id || null,
    ]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "surname" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "patronymic" TEXT,
          "date_birthday" TEXT NOT NULL,
          "gender" BOOLEAN NOT NULL,
          "phone" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "bonus_card_id" int,
          FOREIGN KEY ("bonus_card_id") REFERENCES "bonus_card" ("id")
        );
      `);
    }
  }
}

export default ClientModel;