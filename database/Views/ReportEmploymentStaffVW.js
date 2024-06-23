/**
 * Вью таблица Отчета "О занятости специалиста"
 */

import BaseVW from "./BaseVW.js";

class ReportEmploymentStaffVW extends BaseVW {
  tableName = 'report_employment_staff_vw';

  async getDataReport(staff_id, date) {
    return await global.db.any(`SELECT * FROM ${this.tableName} WHERE staff_id = $1 AND date = $2`, [staff_id, date]);
  }

  async createView() {
    if(!await this.isCreatedTable()) {
      await global.db.query(`
        CREATE VIEW ${this.tableName} AS
        SELECT
          CONCAT(staff.surname, ' ', staff.name, ' ', staff.patronymic) AS staff_fio,
          orders.staff_id,
          CONCAT(clients.surname, ' ', clients.name, ' ', clients.patronymic) AS client_fio,
          services.name AS service_name,
          orders.date,
          TO_CHAR(orders.date::date, 'DD.MM.YYYY') AS human_date,
          CONCAT(orders.hour, ':00') as hour,
          status_order.name AS status_order_name
        FROM orders
        INNER JOIN clients
          ON clients.id = orders.client_id
        INNER JOIN staff
          ON staff.id = orders.staff_id
        INNER JOIN services
          ON services.id = orders.service_id
        INNER JOIN status_order
          ON status_order.id = orders.status_order_id
      `);
    }
  }
}

export default ReportEmploymentStaffVW;