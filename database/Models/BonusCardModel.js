/**
 * Модель "Бонусная карта"
 */

import BaseModel from "./BaseModel.js";

class BonusCardModel extends BaseModel {
  tableName = 'bonus_card';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (name, discount) VALUES($1, $2) RETURNING id`, [data.name, data.discount]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "discount" INTEGER NOT NULL
        );
      `);

      await this.create({ name: 'Обычная', discount: 1 });
      await this.create({ name: 'Золотая', discount: 3 });
      await this.create({ name: 'Платиновая', discount: 5 });
    }
  }
}

export default BonusCardModel;