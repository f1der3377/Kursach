/**
 * Вью таблица Отчета "Об объеме работ мастеров"
 */

import BaseVW from "./BaseVW.js";

class ReportVolumeWorkStaffVW extends BaseVW {
  tableName = 'report_volume_work_staff_vw';

  async getDataReport() {
    return await global.db.any(`SELECT * FROM ${this.tableName}`);
  }

  async getTotalSum() {
    return await global.db.any(`SELECT CONCAT(SUM(price), ' ₽') AS price FROM orders`);
  }

  async createView() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE VIEW ${this.tableName} AS
        SELECT
          CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic) AS staff_fio,
          COUNT(orders.service_id) AS count_order,
          CONCAT(SUM(price), ' ₽') AS price_string
        FROM orders
        INNER JOIN staff
          ON staff.id = orders.staff_id
        GROUP BY
            CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic)
      `);
    }
  }
}

export default ReportVolumeWorkStaffVW;