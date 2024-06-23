/**
 * Модель "Пользователи системы"
 */

import BaseModel from "./BaseModel.js";

class UserModel extends BaseModel {
  tableName = 'users';

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (name, role) VALUES($1, $2) RETURNING id`, [data.name, data.role]);
  }

  async createTable() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE TABLE IF NOT EXISTS "${this.tableName}" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "role" TEXT NOT NULL
        );
      `);

      await this.create({ name: 'Пользователь директор', role: 'директор' });
      await this.create({ name: 'Пользователь администратор', role: 'администратор' });
    }
  }
}

export default UserModel;