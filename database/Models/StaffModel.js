/**
 * Модель "Персонал салона"
 */

import BaseModel from "./BaseModel.js";

class StaffModel extends BaseModel {
  tableName = 'staff';

  /**
   * Функция возвращает список свободных мастеров в зависимости от вида услуги, даты, часа оказания услуги
   */
  async getListFreeStaffDate(service_id, date, hour) {
    return await global.db.any(`
      SELECT DISTINCT
        staff.id,
        CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic) AS staff_fio
      FROM staff
      INNER JOIN staff_service
        ON 
          staff_service.service_id = $1
          AND staff_service.staff_id = staff.id
      LEFT JOIN orders
        ON
          orders.staff_id = staff.id
          AND orders.date = $2
          AND orders.hour = $5
          AND orders.status_order_id = 1
      WHERE 
        orders.id IS NULL
        AND $3::date >= staff.date_start_work::date
        AND (
            $4::date < staff.date_end_work::date
            OR staff.date_end_work IS NULL 
        )
    `, [service_id, date, date, date, hour])
  }

  async create(data) {
    return await global.db.one(`INSERT INTO ${this.tableName} (
      surname,
      name,
      patronymic,
      date_birthday,
      gender,
      phone,
      date_start_work,
      date_end_work
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
      data.date_start_work,
      data.date_end_work || null
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
          "date_start_work" TEXT NOT NULL,
          "date_end_work" TEXT
        );
      `);
    }
  }
}

export default StaffModel;